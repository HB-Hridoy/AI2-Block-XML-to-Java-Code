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
        const mutation = block.querySelector('mutation');
        if (!mutation) return null; // Skip block if no mutation

        const blockType = this.parseBlockType(block);
        const component = mutation.getAttribute('instance_name');
        
        // Prepare block data with block type and instance name
        const blockData = {
            'block_type': blockType,
            'component': component,
        };

        switch (blockType) {
            case 'component_method': {
                const methodName = mutation.getAttribute('method_name');
                const args = this.parseArguments(block); // Parse arguments
                return `Invoke(GetComponentByName("${component}"), "${methodName}", ${args});`;
            }
            case 'SetProperty': {
                const property = block.querySelector('field[name="PROP"]').textContent;
                const value = this.parseValue(block.querySelector('value[name="VALUE"]'));
                //console.log('Value - ' + value);
                return `SetProperty(GetComponentByName("${component}"), "${property}", ${value?.value});`;
            }
            default:
                return blockData;
        }
    }


    // Function to parse arguments from the block
    parseArguments(block) {
        const args = [];
        let index = 0;

        while (true) {
            const argField = block.querySelector(`value[name="ARG${index}"]`);
            if (!argField) break; // Exit loop if ARG not found

            const argBlock = argField.querySelector('block');
            if (!argBlock) break; // Exit loop if argBlock not found

            const argBlockType = this.parseBlockType(argBlock);
            const argBlockValue = this.getBlockValue(argBlock);
            //console.log(argBlockType);

            // Handle different block types
            switch (argBlockType) {
                case 'GetProperty':
                    args.push(argBlockValue.value);
                    break;
                case 'GetComponent':
                    args.push(`GetComponentByName("${argBlockValue}")`);
                    break;
                case 'GetComponent':
                    args.push(`GetComponentByName("${argBlockValue}")`);
                    break;
                case 'text':
                case 'math_number':
                    args.push(argBlockValue);
                    break;
                default:
                    args.push({
                        block_type: argBlockType,
                        value: argBlockValue,
                    });
                    break;
            }
            index++; // Increment index for next ARG
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

        const blockType = this.parseBlockType(block);
        const blockValue = this.getBlockValue(block);
        
        switch (blockType) {
            case 'GetProperty':
                return {
                    value: `GetProperty(GetComponentByName("${blockValue.component}"), "${blockValue.property}")`
                };
            case 'GetComponent':
                return {
                    value: `GetComponentByName("${blockValue.component}")`
                };
            case 'component_method':
            case 'text':
            case 'math_number':
                return {
                    value: blockValue
                };
            default:
                return null; // Return null if block type is not recognized
        }
    }


    // Extract value from a block (handles different types)
    getBlockValue(block) {
        const type = block.getAttribute('type');
        switch (type) {
            case 'text': {
                const textValue = block.querySelector('field[name="TEXT"]').textContent;
                return `"${textValue}"`;
            }
            case 'component_component_block': {
                return block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent;
            }
            case 'component_set_get': {
                const blockMutation = block.querySelector('mutation');
                const blockComponent = block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent;
                const blockProperty = block.querySelector('field[name="PROP"]').textContent;
                if (!blockMutation) return null; // Return null if mutation is missing

                const setOrGet = blockMutation.getAttribute('set_or_get');

                switch (setOrGet) {
                    case 'set' : {
                        return "SetProp"
                    }
                    case 'get' : {
                        return {
                            value: `GetProperty(GetComponentByName("${blockComponent}"), "${blockProperty}")`
                        };
                    }
                }
            }
            case 'component_method': {
                //console.log(this.parseBlock(block));
                return this.parseBlock(block); // Delegate to parseBlock for method blocks

            }
            case 'lexical_variable_get': {
                const varValue = block.querySelector('field[name="VAR"]').textContent;
                return varValue.startsWith('GetComponent_') ? varValue.replace('GetComponent_', '') : null;
            }
            default:
                if (type.startsWith('math_')) {
                    if (type === 'math_number') {
                        const numStr = block.querySelector('field[name="NUM"]').textContent;
                        const num = parseInt(numStr, 10);
                        return isNaN(num) ? 0 : num;
                    }
                    return 'Math operation cannot be parsed (Do it yourself)';
                }
                return null; // Default return for unhandled block types
        }
    }


    parseBlockType(block) {
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
            case 'lexical_variable_get': {
                const varValue = block.querySelector('field[name="VAR"]').textContent;
                return varValue.startsWith('GetComponent_') ? 'GetComponent' : 'undefined variable';
            }
            default: {
                return blockType; // Default to returning the block type
            }
        }
    }

}

// Function to convert XML input to JSON format and display the result
function convertXmlToJavaV2() {
    //const xmlInput = document.getElementById('xmlInput').value; // Get the input XML string
    //const resultDiv = document.getElementById('result'); // Get the result display element
    
    const xmlInput = xmlInputEditor.getValue();

    try {
        const parser = new AI2XMLParserJAVA_v2(xmlInput); // Create a new AI2XMLParser instance
        const result = parser.parse(); // Parse the XML

        outputEditor.setValue('');

            // Loop through keys from 1 to the maximum number
            for (let i = 1; i <= Object.keys(result).length; i++) {
                const key = i.toString(); // Convert number to string
                //outputEditor.setLine(i, jsonData[key]);
                //outputEditor.replaceRange(jsonData[key], CodeMirror.Pos(i));

                var cursor = outputEditor.getCursor(); // Get the current cursor position
                outputEditor.replaceRange(result[key] + '\n', { line: cursor.line + 1, ch: 0 }); // Insert a new line
                //outputEditor.focus(); // Keep focus on the editor
            }
            //const formattedString = formattedLines.join('\n'); // Join lines with new line character
            //outputEditor.setValue(formattedString); // Set the formatted string in CodeMirror
        
    
    } catch (error) {
        outputEditor.setValue('Error parsing XML: ' + error.message);
        //resultDiv.textContent = 'Error parsing XML: ' + error.message; // Display error if parsing fails
    }
}
