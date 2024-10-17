// Class for parsing AI2 XML and converting it into JSON

// Jobs to do - 
// 1. Arguments are getting maximum numbers
// undefined in set properties
class AI2XMLParserJAVA_v2 {
    constructor(xml) {
        // DOMParser to parse XML from the string
        const parser = new DOMParser();
        this.doc = parser.parseFromString(xml, "text/xml");
        this.blockCount = 0; // To keep track of block numbering
       
    }

    // Main parse function that looks for procedure blocks and starts the parsing process
    parse() {
       
        // const blocks = this.doc.querySelectorAll('block[type="procedures_defnoreturn"] > statement[name="STACK"] > block');
        // const blocks = this.doc.querySelectorAll('block[type="procedures_defnoreturn"]:not(:has(statement[name="STACK"] > block))');

        // Select the top-level "procedures_defnoreturn" block
        // Get the first stack inside the 'procedures_defnoreturn' block

        // Locate the procedures_defnoreturn block
        const procedureBlock = this.doc.querySelector('block[type="procedures_defnoreturn"] > statement[name="STACK"]');

        // Ensure the procedureBlock exists
        if (!procedureBlock) {
            console.error("No stack found inside procedures_defnoreturn block.");
        } else {
            // Query all direct child blocks from the first STACK found
            const blocks = procedureBlock.querySelectorAll(':scope > block');
            return this.parseBlocks(blocks);
        }
        
    }
    static finalResult = {};
    // Function to parse multiple blocks
    parseBlocks(blocks) {
        //const result = {};
        blocks.forEach((block) => {
            //console.log(block);
            this.parseBlockAndNext(block, finalResult);
        });
        return finalResult;
    }

    // Recursive function to parse blocks and their 'next' blocks
    parseBlockAndNext(block, result) {
        while (block) {
            //console.log(block);
            const blockData = this.parseBlock(block); // Parse a single block
            if (blockData) {
                this.blockCount++;
                result[this.blockCount] = blockData;
            }
            
            // Get the next block and continue parsing
            const nextElement = block.querySelector('next');
            block = nextElement ? nextElement.querySelector('block') : null;
        }
    }

    // Parse a single block and extract relevant data based on type
    parseBlock(block) {
        const mutation = block.querySelector('mutation');
        if (!mutation) return null; // Skip block if no mutation

        const blockType = this.getBlockType(block);
        const component = mutation.getAttribute('instance_name');
        
        // Prepare block data with block type and instance name
        const blockData = {
            'block_type': blockType,
            'component': component,
        };

        switch (blockType) {
            case 'component_method': {
                const methodName = mutation.getAttribute('method_name');
                let args = '';
                args = this.parseArguments(block); // Parse arguments
                return `Invoke(GetComponentByName("${component}"), "${methodName}", ${args});`;
            }
            case 'SetProperty': {
                const propertyName = block.querySelector('field[name="PROP"]').textContent;
                const propertyValue = this.parseValue(block.querySelector('value[name="VALUE"]'));
                //console.log('Value - ' + value);
                return `SetProperty(GetComponentByName("${component}"), "${propertyName}", ${propertyValue});`;
            }
            case 'local_declaration_statement' : {
                console.log(JSON.stringify(this.parseLocalVariableDeclaration(block)));
                return 'LocalVariableSuccess'
            }
            default:
                return blockData;
        }
    }


// Function to parse arguments from the block
parseArguments(block) {
    const args = [];
    let argIndex = 0; // Start with the first argument index

    // Loop through ARG indices
    while (true) {
        // Use a more general selector and then filter for direct children
        const argField = Array.from(block.children).find(child => child.getAttribute('name') === `ARG${argIndex}`);
        if (!argField) break; // Exit loop if ARG not found

        const argBlock = argField.querySelector('block'); // Check for the child block
        if (!argBlock) break; // Exit loop if argBlock not found

        // Get the block type for the argument
        const argBlockType = this.getBlockType(argBlock);
        if (!argBlockType) {
            console.error(`Error: Block type for ARG${argIndex} not found.`);
            argIndex++; // Increment index to check the next argument
            continue; // Skip this argument if block type is not found
        }

        // Parse and retrieve the argument value
        const argBlockValue = this.getBlockValue(argBlock, argBlockType);
        args.push(argBlockValue); // Add to args array
        argIndex++; // Move to the next argument index
    }

    // Format the args into new Object[]{ARG0, ARG1, ARG2, ...}
    const formattedArgs = args.join(", ");
    return `new Object[]{${formattedArgs}}`; // Return formatted string
}


    // Parse value elements within blocks
    parseValue(valueBlock) {
        if (!valueBlock) return null;

        const block = valueBlock.querySelector('block');
        if (!block) return null;

        const blockType = this.getBlockType(block);
        const blockValue = this.getBlockValue(block, blockType);
        
        return blockValue;
    }


    // Extract value from a block (handles different types)
    getBlockValue(block, blockType) {

        if (!blockType) {
            return "getBlockValue - No block type found"; // Handle missing block type
        }
        //console.log(blockType);
        //console.log(block);
        
        switch (blockType) {
            case 'text': {
                const textValue = block.querySelector('field[name="TEXT"]').textContent;
                return `"${textValue}"`;
            }
            case 'GetComponent': {
                const blockMutation = block.querySelector('mutation');
                //console.log(blockMutation);
                const componentName = blockMutation.getAttribute('instance_name');
                //const componentName = block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent;
                return `GetComponentByName("${componentName}")`
            }
            case 'GetProperty' : {
                const blockMutation = block.querySelector('mutation');
                const componentName = blockMutation.getAttribute('instance_name');
                const propertyName = blockMutation.getAttribute('property_name');
                //const blockComponent = block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent;
                //const blockProperty = block.querySelector('field[name="PROP"]').textContent;
                if (!blockMutation) return null; // Return null if mutation is missing

                 return `GetProperty(GetComponentByName("${componentName}"), "${propertyName}")`;
            }
            case 'component_method': {
                //console.log(this.parseBlock(block));
                return this.parseBlock(block); // Delegate to parseBlock for method blocks

            }
            case 'number' : {
                const numStr = block.querySelector('field[name="NUM"]').textContent;
                const num = parseInt(numStr, 10);
                return isNaN(num) ? 0 : num;
                        
            }
            case 'boolean' : {
                return block.querySelector('field[name="BOOL"]').textContent.toLowerCase();
                
            }
            case 'lexical_variable_get' : {
                const varValue = block.querySelector('field[name="VAR"]').textContent;
                if (varValue.startsWith('GetComponent_')){
                    const componentName =  varValue.replace('GetComponent_', '');
                    return `GetComponentByName("${componentName}")`
                } else if (varValue.startsWith('param_')){
                    const paramIndex = varValue.split("_")[1];
                    return `paramValues.get(${paramIndex})`
                }  else if (varValue.startsWith('GetVar_')){
                    return varValue.replace('GetVar_', '');
                }
                else {
                    //return varValue.startsWith('GetComponent_') ? 'GetComponent' : 'undefined variable';
                return 'unknown_variable_type'
                }
                
            }
            case 'list' : {
                return 'Make_a_list'
            }
            case 'local_declaration_statement' : {
                return 'local_declaration_statement'
            }
            default:
                return "No_Block_Value"; // Default return for unhandled block types
        }
    }


    getBlockType(block) {
        const blockType = block.getAttribute('type');
        
        switch (blockType) {
            case 'component_set_get': {
                const blockMutation = block.querySelector('mutation');
                if (!blockMutation) return null; // Return null if mutation is missing

                const setOrGet = blockMutation.getAttribute('set_or_get');
                return setOrGet === 'get' ? 'GetProperty' : 'SetProperty';
            }
            case 'component_component_block': {
                return 'GetComponent';
            }
            case 'math_number' : {
                return 'number';
            }
            case 'logic_boolean' : {
                return 'boolean';
            }
            case 'lists_create_with' : {
                return 'list'
            }
            default: 
                return blockType;
        }
    }

    parseLocalVariableDeclaration(block){
        //const result = {};
        let index = 0; // Start with VAR0, DECL0

        while (true) {
            // Find the VAR field for the current index
            const varField = block.querySelector(`field[name="VAR${index}"]`);
            const valueField = block.querySelector(`value[name="DECL${index}"]`);

            // Break the loop if either VAR or DECL is not found
            if (!varField || !valueField) break;

            const varName = varField.textContent.trim(); // Extract variable name

            // Retrieve the block inside the corresponding DECL value
            const valueBlock = valueField.querySelector('block');
            if (!valueBlock) {
                console.error(`Error: Block not found for DECL${index}.`);
                index++;
                continue; // Skip to the next iteration if no block is found
            }

            const varType = valueBlock.getAttribute('type'); // Extract block type
            const varValueType = this.getBlockType(valueBlock);
            const varValue = this.getBlockValue(valueBlock, varValueType); // Extract the full block HTML

            // Store the result with numeric keys (1, 2, 3, ...)
            //result[index + 1] = { varName, varType, varValue };
            this.blockCount++;
            finalResult[this.blockCount] = `${varType} ${varName} = ${varValue};`;

            index++; // Move to the next VAR/DECL index
        }

        //return result; // Return the result object
        const procedureBlock = this.doc.querySelector('statement[name="STACK"]');

        // Ensure the procedureBlock exists
        if (!procedureBlock) {
            console.error("No stack found inside procedures_defnoreturn block.");
        } else {
            // Query all direct child blocks from the first STACK found
            const blocks = procedureBlock.querySelectorAll(':scope > block');
            return this.parseBlocks(blocks);
        }

    }

    // Function to parse join block
    parseJoinBlock(block) {
        const jBlocks = [];
        let joinIndex = 0; // Start with the first argument index

        // Loop through ARG indices
        while (true) {
            // Use a more general selector and then filter for direct children
            const joinField = Array.from(block.children).find(child => child.getAttribute('name') === `ADD${argIndex}`);
            if (!joinField) break; // Exit loop if ARG not found

            const argBlock = argField.querySelector('block'); // Check for the child block
            if (!argBlock) break; // Exit loop if argBlock not found

            // Get the block type for the argument
            const argBlockType = this.getBlockType(argBlock);
            if (!argBlockType) {
                console.error(`Error: Block type for ARG${argIndex} not found.`);
                argIndex++; // Increment index to check the next argument
                continue; // Skip this argument if block type is not found
            }

            // Parse and retrieve the argument value
            const argBlockValue = this.getBlockValue(argBlock, argBlockType);
            args.push(argBlockValue); // Add to args array
            argIndex++; // Move to the next argument index
        }

        // Format the args into new Object[]{ARG0, ARG1, ARG2, ...}
        const formattedArgs = args.join(", ");
        return `new Object[]{${formattedArgs}}`; // Return formatted string
    }

}

// Initialize code editors for input and output

document.addEventListener('DOMContentLoaded', function () {
    // Initialize CodeMirror for XML input
    window.xmlInputEditor = CodeMirror.fromTextArea(document.getElementById("xmlInput"), {
        lineNumbers: true,
        mode: "application/xml",
        theme: "material",
    });

    // Initialize CodeMirror for output
    window.outputEditor = CodeMirror.fromTextArea(document.getElementById("outputEditor"), {
        lineNumbers: true,
        mode: "application/json", // Change to your preferred mode
        theme: "material",
    });
    outputEditor.setSize(null, 500);

    if (localStorage.getItem('isConditionsReady') === 'true'){

        conditionsCheckboxContainer.style.display = 'block';
    } else {
       conditionsCheckboxContainer.style.display = 'none';
    }
    
});

 // Get the checkbox element and status div
 const conditionsCheckbox = document.getElementById('applyConditionsCheckbox');
 let conditionsCheckboxstatus = false;

 // Add an event listener to the checkbox
 conditionsCheckbox.addEventListener('change', function() {
    if (conditionsCheckbox.checked) {

        conditionsCheckboxstatus = true;

     } else {
        // Checkbox is unchecked
        conditionsCheckboxstatus = false
     }
 });

// Function to replace oldValue with newValue in a given text
function ApplyConditions(text) {
    let conditions = JSON.parse(localStorage.getItem('conditions')); // Retrieve conditions from localStorage
    let isConditionsReady = localStorage.getItem('isConditionsReady'); // Retrieve isConditionsReady flag
    
    // Check if conditions and isConditionsReady flag are valid
    if (conditions && isConditionsReady === 'true') {

        conditions.forEach(condition => {
            // Check if oldValue is found in the text
            if (text.includes(condition.oldValue)) {
             // Replace all occurrences of oldValue with newValue
             while (text.indexOf(condition.oldValue) !== -1) {
                 text = text.replace(condition.oldValue, condition.newValue);
             }
         }
         });
        return text; // Return the modified text
    } else {
        console.log('Conditions are not ready or not found');
        return text; // Return the original text if conditions are not ready
    }
}

function copyInput() {
    const inputValue = xmlInputEditor.getValue();
    navigator.clipboard.writeText(inputValue).then(() => {
        showSuccessToast('XML copied to clipboard');
    }).catch(err => {
        showDangerToast('Failed to copy XML to clipboard');
    });
}

function clearInput() {
    xmlInputEditor.setValue(''); // Clear the input editor
}

function copyOutput() {
    const outputValue = outputEditor.getValue();
    navigator.clipboard.writeText(outputValue).then(() => {
        showSuccessToast('Output copied to clipboard');
    }).catch(err => {
        showDangerToast('Failed to copy output to clipboard');
    });
}

function clearOutput() {
    outputEditor.setValue(''); // Clear the output editor
}

const conditionsCheckboxContainer = document.getElementById('conditionsCheckboxContainer');
// Monitor local storage changes
window.addEventListener('storage', function(event) {
    if (event.key === 'isConditionsReady') {
        if (localStorage.getItem('isConditionsReady') === 'true'){
            conditionsCheckboxContainer.style.display = 'flex';
        } else {
            conditionsCheckboxContainer.style.display = 'none';
        }
        console.log(localStorage.getItem('isConditionsReady'));
    }
});



 // Function to show success toast
 function showSuccessToast(message) {
    const toastElement = document.getElementById('toast-success');
    const toastTextElement = document.getElementById('toast-success-text');
    
    toastTextElement.textContent = message;
    toastElement.style.display = 'flex';

    // Automatically hide the toast after 3 seconds
    setTimeout(() => {
        hideToast('toast-success');
    }, 2000);  // Adjust duration as needed
}

// Function to show danger toast
function showDangerToast(message) {
    const toastElement = document.getElementById('toast-danger');
    const toastTextElement = document.getElementById('toast-danger-text');
    
    toastTextElement.textContent = message;
    toastElement.style.display = 'flex';

    // Automatically hide the toast after 3 seconds
    setTimeout(() => {
        hideToast('toast-danger');
    }, 2000);  // Adjust duration as needed
}

// Function to show warning toast
function showWarningToast(message) {
    const toastElement = document.getElementById('toast-warning');
    const toastTextElement = document.getElementById('toast-warning-text');
    
    toastTextElement.textContent = message;
    toastElement.style.display = 'flex';

    // Automatically hide the toast after 3 seconds
    setTimeout(() => {
        hideToast('toast-warning');
    }, 2000);  // Adjust duration as needed
}

// Function to hide a toast
function hideToast(toastElement) {
    const toast = document.getElementById(toastElement);
    toast.style.display = 'none';
}

// Add event listeners to close buttons
document.querySelectorAll('[data-dismiss-target]').forEach(button => {
    button.addEventListener('click', function() {
        const target = document.querySelector(this.getAttribute('data-dismiss-target'));
        if (target) {
            hideToast(target);
        }
    });
});







// Function to convert XML input to JSON format and display the result
function convertXmlToJavaV2() {
    const xmlInput = xmlInputEditor.getValue();

    try {
        const parser = new AI2XMLParserJAVA_v2(xmlInput); // Create a new AI2XMLParser instance
        const result = parser.parse(); // Parse the XML

        outputEditor.setValue('');

            // Loop through keys from 1 to the maximum number
            for (let i = 1; i <= Object.keys(result).length; i++) {
                const key = i.toString(); // Convert number to string

                var cursor = outputEditor.getCursor(); // Get the current cursor position
                if (conditionsCheckboxstatus){
                    const resultAfterConditions = ApplyConditions(ApplyConditions(result[key]));
                    //console.log('Applied Conditions - ' + resultAfterConditions);
                    outputEditor.replaceRange(resultAfterConditions + '\n', { line: cursor.line + 1, ch: 0 }); // Insert a new line
                } else {
                    outputEditor.replaceRange(result[key] + '\n', { line: cursor.line + 1, ch: 0 }); // Insert a new line
                }
                
                //console.log(result[key]);

            }
    
    } catch (error) {
        outputEditor.setValue('Error parsing XML: ' + error.message);// Display error if parsing fails
    }
}
