// Class for parsing AI2 XML and converting it into JSON

class AI2XMLParserJAVA_v2 {
    constructor(xml) {
        // DOMParser to parse XML from the string
        const parser = new DOMParser();
        this.doc = parser.parseFromString(xml, "text/xml");
        this.finalResultArray = [];
        
       
    }
    parse() {
        const procedureStackBlock = this.doc.querySelector(
            'block[type="procedures_defnoreturn"] > statement[name="STACK"] > block'
        );

        if (!procedureStackBlock) {
            console.error("No stack found inside procedures_defnoreturn block.");
            return [];
        }
        this.parseRecursive(procedureStackBlock)
        
        return this.finalResultArray;
    }
    
   // Recursive function to parse a block and its "next" siblings
   parseRecursive(block) {
        while (block) {

            const blockData = this.parseBlock(block, true); // Parse a single block
            if (blockData) {
                this.finalResultArray.push(blockData);
            }
            
            // Get the immediate <next> element (only direct child)
            const nextElement = block.querySelector(':scope > next');

            // If <next> exists, get the <block> inside it, otherwise log an error message
            if (nextElement) {
                block = nextElement.querySelector(':scope > block');
            } else {
                console.log(`Task Complete. Blocks Generated - ${this.finalResultArray.length}`);
                block = null;
            }

        }
    }

    
    // Parse a single block and handle it based on type.
    parseBlock(block, isIndepended) {

        const mutation = block.querySelector('mutation');
        if (!mutation) return "/* Skipped: No mutation */";

        const blockType = this.getBlockType(block);
        const component = mutation.getAttribute('instance_name') || "unknown_component";

        switch (blockType) {
            case 'component_method': {
                const methodName = mutation.getAttribute('method_name').trim();
                const args = this.parseArguments(block);
                
                if (isIndepended){
                    return `Invoke(GetComponentByName("${component}"), "${methodName}", ${args});`;
                } else {
                    return `Invoke(GetComponentByName("${component}"), "${methodName}", ${args})`;
                }
                
            }
            case 'SetProperty': {
                const propertyName = block.querySelector('field[name="PROP"]').textContent.trim();
                const propertyValue = this.parseValue(block.querySelector('value[name="VALUE"]'));
                return `SetProperty(GetComponentByName("${component}"), "${propertyName}", ${propertyValue});`;
            }
            case 'local_declaration_statement' : {
                return this.parseLocalVariableDeclaration(block);
            }
            case 'lexical_variable_set' : {
                let varName = block.querySelector('field[name="VAR"]').textContent.trim();
                const varValue = this.parseValue(block.querySelector('value[name="VALUE"]'));
                if (varName.startsWith('global ')) {
                   varName =  varName.replace(/^global\s+/, '');
                }
                return `${varName} = ${varValue}`;
            }
            case 'controls_forRange' : {
                this.parseForLoop(block);
                return `// for loop ends`;
            }
            default:
                return `/* Unhandled block type: ${blockType} */`;
        }

    }

        
    


    // Function to parse arguments from the block
    parseArguments(block) {
        const args = []; // Array to store argument values

        // Iterate through all possible argument fields (ARG0, ARG1, ARG2, ...)
        for (let argIndex = 0; ; argIndex++) {
            // Find the direct child <value> element with the corresponding ARG name
            const argField = block.querySelector(`:scope > value[name="ARG${argIndex}"]`);
            if (!argField) break; // Exit loop if no more ARG fields are found

            // Retrieve the block inside the <value> element
            const argBlock = argField.querySelector(':scope > block');
            if (!argBlock) {
                console.warn(`Warning: Missing block for ARG${argIndex}`);
                continue; // Skip this argument if no block is found
            }

            // Get the block type and value for the argument
            const argBlockType = this.getBlockType(argBlock);
            if (!argBlockType) {
                console.error(`Error: Block type for ARG${argIndex} not found.`);
                continue; // Skip this argument if block type is not found
            }

            const argBlockValue = this.getBlockValue(argBlock, argBlockType);
            args.push(argBlockValue); // Add argument value to the array
        }

        // Format the arguments into a string: new Object[]{ARG0, ARG1, ...}
        const formattedArgs = args.length ? args.join(", ") : ''; // Handle empty case
        return `new Object[]{${formattedArgs}}`; // Return the formatted string
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
            return "getBlockValue - No block type found";
        }

        switch (blockType) {
            case 'text': {
                const textValue = block.querySelector('field[name="TEXT"]').textContent.trim(); // trim to remove extra spaces
                return `"${textValue}"`;
            }
            case 'GetComponent': {
                const blockMutation = block.querySelector('mutation');
                const componentName = blockMutation.getAttribute('instance_name').trim();
                return `GetComponentByName("${componentName}")`;
            }
            case 'GetProperty': {
                const blockMutation = block.querySelector('mutation');
                const componentName = blockMutation.getAttribute('instance_name').trim();
                const propertyName = blockMutation.getAttribute('property_name').trim();
                if (!blockMutation) return null;

                return `GetProperty(GetComponentByName("${componentName}"), "${propertyName}")`;
            }
            case 'component_method': {
                return this.parseBlock(block, false);
            }
            case 'number': {
                const numStr = block.querySelector('field[name="NUM"]').textContent.trim();
                const num = parseInt(numStr, 10);
                return isNaN(num) ? 0 : num;
            }
            case 'boolean': {
                return block.querySelector('field[name="BOOL"]').textContent.trim().toLowerCase();
            }
            case 'lexical_variable_get': {
                const varValue = block.querySelector('field[name="VAR"]').textContent.trim();
                if (varValue.startsWith('param_')) {
                    const paramIndex = varValue.split("_")[1];
                    return `paramValues.get(${paramIndex})`;
                } else if (varValue.startsWith('global ')) {
                    return varValue.replace(/^global\s+/, '');
                }
                return varValue;
            }
            case 'list': {
                return this.parseList(block);
            }
            case 'local_declaration_statement': {
                return 'local_declaration_statement';
            }
            case 'text_join' : {
                return this.parseJoinArguments(block);
            }
            default:
                return "No_Block_Value";
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
        
        let sectionName = "";
        let nestedBlockCount = 0;
        let index = 0; // Start with VAR0, DECL0

        while (true) {
            // Find the VAR field for the current index
            const varField = block.querySelector(`field[name="VAR${index}"]`);
            const valueField = block.querySelector(`value[name="DECL${index}"]`);

            // Break the loop if either VAR or DECL is not found
            if (!varField || !valueField){
                this.finalResultArray.push(' ');
                break;
            } 

            const varName = varField.textContent.trim(); // Extract variable name

            if (index === 0){
                sectionName = varName;
                this.finalResultArray.push(' ');
                this.finalResultArray.push(`// ${sectionName} started`);
            }
            // Retrieve the block inside the corresponding DECL value
            const valueBlock = valueField.querySelector('block');
            if (!valueBlock) {
                console.error(`Error: Block not found for DECL${index}.`);
                index++;
                continue; // Skip to the next iteration if no block is found
            }

            const varType = valueBlock.getAttribute('type'); // Extract block type
            let formattedVarType = '';
            switch (varType){
                case 'text' :{
                    formattedVarType =  'String';
                    break;
                }
                case 'component_component_block' : {
                    formattedVarType =  'Object';
                    break;
                }
                case 'number' : {
                    formattedVarType =  'int';
                    break;
                }
                case 'boolean ' : {
                    formattedVarType = 'boolean';
                    break;
                }
                case 'lexical_variable_get' : {
                    formattedVarType = 'Object';
                    break;
                }
                default:
                    formattedVarType = 'Object';
            }
            const varValueType = this.getBlockType(valueBlock);
            const varValue = this.getBlockValue(valueBlock, varValueType); // Extract the full block HTML

            const varDeclare = `${formattedVarType} ${varName} = ${varValue};`;
            this.finalResultArray.push(varDeclare);

            index++; // Move to the next VAR/DECL index
        }

        //console.log(varDeclarations);
        const stackBlock = block.querySelector('statement[name="STACK"] > block');
        let nestedBlock = stackBlock;
        
        if (!stackBlock) {
            console.error("No stack found inside local_declaration_statement block.");
            return '/* Empty local variable declaration */';
        }

        while (nestedBlock) {

            const blockData = this.parseBlock(nestedBlock, true); // Parse a single block
            if (blockData) {
                this.finalResultArray.push(blockData);
                nestedBlockCount++;
            }
            
            // Get the immediate <next> element (only direct child)
            const nextElement = nestedBlock.querySelector(':scope > next');

            // If <next> exists, get the <block> inside it, otherwise log an error message
            if (nextElement) {
                nestedBlock = nextElement.querySelector(':scope > block');
            } else {
                console.log(`Local Variable Blocks Generated - ${nestedBlockCount}`);
                nestedBlock = null;
            }

        }

        return `// ${sectionName} ended`;
    

    }

    // Function to parse 'join' block (concatenates arguments)
    parseJoinArguments(block) {
        const joinValues = [];
        let joinIndex = 0; // Start with the first join index

        // Loop through ADD indices to collect joinable blocks
        while (true) {
            // Find the ADD field with the current joinIndex
            const joinField = Array.from(block.children).find(
                child => child.getAttribute('name') === `ADD${joinIndex}`
            );
            if (!joinField) break; // Exit loop if no more ADD fields are found

            // Check for a nested block within the ADD field
            const joinBlock = joinField.querySelector('block');
            if (!joinBlock) break; // Exit if no nested block found

            // Get the block type for the join argument
            const joinBlockType = this.getBlockType(joinBlock);
            if (!joinBlockType) {
                console.error(`Error: Block type for ADD${joinIndex} not found.`);
                joinIndex++; // Move to the next ADD index
                continue; // Skip this iteration if block type is not found
            }

            // Parse and retrieve the join value
            const joinBlockValue = this.getBlockValue(joinBlock, joinBlockType);
            joinValues.push(joinBlockValue); // Add the value to joinValues array

            joinIndex++; // Move to the next ADD index
        }

        // Concatenate the join values using ' + ' (for string concatenation)
        return joinValues.join(" + ");
    }

    // Function to parse a list of arguments from the block
    parseList(block) {
        const list = []; // Array to store argument values

        // Iterate through all possible argument fields (ADD0, ADD1, ADD2, ...)
        for (let index = 0; ; index++) {
            // Find the direct child <value> element with the corresponding ADD name
            const valueField = block.querySelector(`:scope > value[name="ADD${index}"]`);
            if (!valueField) break; // Exit loop if no more ADD fields are found

            // Retrieve the block inside the <value> element
            const valueBlock = valueField.querySelector(':scope > block');
            if (!valueBlock) {
                console.warn(`Warning: Missing block for ADD${index}`);
                continue; // Skip if no block is found
            }

            // Get the block type and value for the argument
            const valueBlockType = this.getBlockType(valueBlock);
            if (!valueBlockType) {
                console.error(`Error: Block type for ADD${index} not found.`);
                continue; // Skip if block type is not found
            }

            const valueBlockValue = this.getBlockValue(valueBlock, valueBlockType);
            list.push(valueBlockValue); // Add value to the list
        }

        // Format the list into a string: new Object[]{ADD0, ADD1, ...}
        const formattedList = list.length ? list.join(", ") : ''; // Handle empty case
        return `YailList.makeList(new Object[]{${formattedList}})`; // Return the formatted string
    }


    parseForLoop(forLoopBlock){

        let nestedBlockCount = 0;

        if (forLoopBlock) {
            // Get the VAR field value
            const varField = forLoopBlock.querySelector('field[name="VAR"]');
            const indexName = varField ? varField.textContent : 'indexNameNotFound';
        
            // Get the START value
            const startValueBlock = forLoopBlock.querySelector('value[name="START"]');
            const start = startValueBlock ? this.parseValue(startValueBlock) : 0;
        
            // Get the END value
            const endValueBlock = forLoopBlock.querySelector('value[name="END"]');
            const end = endValueBlock ? this.parseValue(endValueBlock) : 0;
        
            // Get the STEP value
            const stepValueBlock = forLoopBlock.querySelector('value[name="STEP"]');
            const step = stepValueBlock ? this.parseValue(stepValueBlock) : 0;

            //Adds the first line of for loop
            this.finalResultArray.push(' ');
            this.finalResultArray.push('// For Loop Starts');
            this.finalResultArray.push(`for (int ${indexName} = ${start}; ${indexName} <= ${end}; ${indexName} += ${step}) {`);
            this.finalResultArray.push(' ');
        
            /* console.log(`VAR: ${indexName}`);
            console.log(`START: ${start}`);
            console.log(`END: ${end}`);
            console.log(`STEP: ${step}`); */

            // Select the <statement> element with the name "DO"
            const doStatement = forLoopBlock.querySelector('statement[name="DO"]');

            if (doStatement) {
                // Get the <block> inside the <statement>
                const innerBlock = doStatement.querySelector('block');
                let nestedBlock = innerBlock;
        
                if (!innerBlock) {
                    console.error("No block found inside For Loop block.");
                    return '/* Empty For Loop Block */';
                }
        
                while (nestedBlock) {

                    const blockData = this.parseBlock(nestedBlock, true); // Parse a single block
                    if (blockData) {
                        this.finalResultArray.push(`    ${blockData}`);
                        nestedBlockCount++;
                    }
                    
                    // Get the immediate <next> element (only direct child)
                    const nextElement = nestedBlock.querySelector(':scope > next');
        
                    // If <next> exists, get the <block> inside it, otherwise log an error message
                    if (nextElement) {
                        nestedBlock = nextElement.querySelector(':scope > block');
                    } else {
                        // Ends the for loop
                        this.finalResultArray.push(' ');
                        this.finalResultArray.push('}');
                        console.log(`For Loop Blocks Generated - ${nestedBlockCount}`);
                        nestedBlock = null;
                    }
        
                }
                
            } else {
                console.error('No <statement name="DO"> found in the For Loop block.');
            }
        } else {
            console.error("No 'controls_forRange' block found.");
        }
        
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
        //console.log(localStorage.getItem('isConditionsReady'));
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
        //console.log(result);
/*
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


            }*/

            for (let i = 0; i < result.length; i++) {
                const key = i.toString(); // Convert number to string

                var cursor = outputEditor.getCursor(); // Get the current cursor position
                if (conditionsCheckboxstatus){
                    const resultAfterConditions = ApplyConditions(ApplyConditions(result[key]));
                    //console.log('Applied Conditions - ' + resultAfterConditions);
                    outputEditor.replaceRange(resultAfterConditions + '\n', { line: cursor.line + 1, ch: 0 }); // Insert a new line
                } else {
                    outputEditor.replaceRange(result[key] + '\n', { line: cursor.line + 1, ch: 0 }); // Insert a new line
                }
            }
            
    
    } catch (error) {
        outputEditor.setValue('Error parsing XML: ' + error.message);// Display error if parsing fails
    }
}
