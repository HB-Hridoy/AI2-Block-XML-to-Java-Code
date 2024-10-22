// Class for parsing AI2 XML and converting it into JSON
class AI2XMLParserJAVA {
    constructor(xml) {
        // DOMParser to parse XML from the string
        const parser = new DOMParser();
        this.doc = parser.parseFromString(xml, "text/xml");
        this.blockCount = 0; // To keep track of block numbering
    }

    // Main parse function that looks for procedure blocks and starts the parsing process
    parse() {
        const blocks = this.doc.querySelectorAll('block[type="procedures_defnoreturn"] > statement[name="STACK"] > block');
        return this.parseBlocks(blocks);
    }

    // Function to parse multiple blocks
    parseBlocks(blocks) {
        const result = {};
        blocks.forEach((block) => {
            this.parseBlockAndNext(block, result);
        });
        return result;
    }

    // Recursive function to parse blocks and their 'next' blocks
    parseBlockAndNext(block, result) {
        while (block) {
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
        const type = block.getAttribute('type'); // Get block type
        const mutation = block.querySelector('mutation'); // Get mutation element
        const blockType = this.parseBlockType(block);
        const component = mutation.getAttribute('instance_name');
        
        
        if (!mutation) return null; // If no mutation, skip this block

        // Prepare block data with block type and instance name
        const blockData = {
            'block_type': blockType,
            'component': component,
        };

        // Handle different block types (method or property)
        if (blockType === 'component_method') {
            const method_name = mutation.getAttribute('method_name');
            const Arguments = this.parseArguments(block); // Parse arguments

            return 'Invoke(GetComponentByName("' + component + '"), "' + method_name + '", ' + Arguments + ');';
            //console.log(block);
        } else if (blockType === 'SetProperty') {
            const property = block.querySelector('field[name="PROP"]').textContent;
            const value = this.parseValue(block.querySelector('value[name="VALUE"]'));

            return 'SetProperty(GetComponentByName("'+ component +'"),"'+ property +'",'+ value.value +');'
            
        } else {
            return blockData;
        }

        
    }

    // Function to parse arguments from the block
    parseArguments(block) {
        const args = {};
        let index = 0;

        while (true) {
            const argField = block.querySelector(`value[name="ARG${index}"]`);
            if (!argField) {
                break; // Break the loop if ARG is not found
            }
            
            const argBlock = argField.querySelector('block');
            const argBlockType = this.parseBlockType(argBlock);
            const argBlockValue = this.getBlockValue(argBlock);
            if (argBlock) {

                if (argBlockType === 'GetProperty'){
                    args[`ARG${index}`] = argBlockValue.value;
                //console.log(blockValue);
                } else if (argBlockType === 'GetComponent'){
                    console.log(argBlockValue);
                    args[`ARG${index}`] ='GetComponentByName("' + argBlockValue + '")';
                } else if (argBlockType === 'text'){
                    args[`ARG${index}`] = argBlockValue;
                } else if (argBlockType === 'math_number'){
                    args[`ARG${index}`] = argBlockValue;
                } else {
                    args[`ARG${index}`] = {
                        block_type: argBlockType,
                        value: argBlockValue,
                    };
                }

                
            }

            index++; // Increment index for next ARG
        }

        // Now format the args into new Object[]{ARG0, ARG1, ARG2, ...}
        const formattedArgs = Object.keys(args)
        .sort() // Ensure the order is ARG0, ARG1, etc.
        .map(argKey => args[argKey]) // Map to get values in order
        .join(", "); // Join with commas

        return `new Object[]{${formattedArgs}}`; // Return formatted string
    }




    // Parse value elements within blocks
    parseValue(valueBlock) {
        if (!valueBlock) return null;
        const block = valueBlock.querySelector('block');
        if (block) {
            const blockType = this.parseBlockType(block);
            const blockValue = this.getBlockValue(block);

            //console.log(blockType);
            if (blockType === 'GetProperty'){
                return {
                    value: 'GetProperty(GetComponentByName("' + blockValue.component + '"), "' + blockValue.property + '")'
                };
               //console.log(blockValue);
            } else if (blockType === 'GetComponent'){
                return {
                    value: 'GetComponentByName("' + blockValue.component + '")'
                };
            } else if (blockType === 'text'){
                return {
                    value: blockValue
                };
            } else if (blockType === 'math_number'){
                 return {
                    value: blockValue
                };
            }
        }
        return null;
    }

    // Extract value from a block (handles different types)
    getBlockValue(block) {
        const type = block.getAttribute('type');
        if (type === 'text') {
            const textValue =  block.querySelector('field[name="TEXT"]').textContent;
            return '"' + textValue + '"';
        } else if (type === 'component_component_block') {
            return block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent;
        } else if (type === 'component_set_get') {
            return {
                component: block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent,
                property: block.querySelector('field[name="PROP"]').textContent
            };
        } else if (type === 'component_method') {
            //console.log(block);
            const valueData = this.parseBlock(block);
            return valueData;
        } else if (type === 'lexical_variable_get'){

            let varValue = block.querySelector('field[name="VAR"]').textContent;

            // Check if it starts with "GetComponent_"
            if (varValue.startsWith('GetComponent_')) {
                // Remove the prefix
                return varValue.replace('GetComponent_', '');
            }
        } else if(type.startsWith('math_')){
            if (type === 'math_number') {
                const numStr = block.querySelector('field[name="NUM"]').textContent;
                const num = parseInt(numStr, 10);
                return isNaN(num) ? 0 : num;
            }
             else {
                return 'Math operation cannot be parsed (Do it yourself)'
            }
            
        }


        return null;
    }

    parseBlockType(block) {

        const blockType = block.getAttribute('type');

        if (blockType === 'component_set_get'){
            const blockMutation = block.querySelector('mutation');
        
            // Ensure mutation element exists
            if (!blockMutation) {
                return;  // Skip if mutation element is missing
            }

            const argSetOrGet = blockMutation.getAttribute('set_or_get');
            if ( argSetOrGet === 'get') {
                return 'GetProperty';
            } else if (argSetOrGet === 'set'){
                return 'SetProperty'
            }
        } else if (blockType === 'component_component_block') {
            return 'GetComponent'
        } else if (blockType === 'lexical_variable_get') {
             // Get the <field> element with name="VAR"
            const varValue = block.querySelector('field[name="VAR"]').textContent;

             // Check if it starts with "GetComponent_"
            if (varValue.startsWith('GetComponent_')) {
                 return 'GetComponent';
            }
        }
        else{
            return blockType;
        }
    }
}

// Function to convert XML input to JSON format and display the result
function convertXmlToJava() {
    const xmlInput = xmlInputEditor.getValue(); // Get the input XML string
    const resultDiv = document.getElementById('result'); // Get the result display element

    try {
        const parser = new AI2XMLParserJAVA(xmlInput); // Create a new AI2XMLParser instance
        const result = parser.parse(); // Parse the XML

        // Convert to JSON and replace escaped quotes
        resultDiv.textContent = JSON.stringify(result, null, 2).replace(/\\"/g, '"'); // Display the parsed result as JSON
        //resultDiv.textContent = result; // Display the parsed result as JSON
    
    } catch (error) {
        resultDiv.textContent = 'Error parsing XML: ' + error.message; // Display error if parsing fails
    }
}
