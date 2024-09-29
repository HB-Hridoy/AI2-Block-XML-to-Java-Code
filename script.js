// Class for parsing AI2 XML and converting it into JSON
class AI2XMLParser {
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
        
        if (!mutation) return null; // If no mutation, skip this block

        // Prepare block data with block type and instance name
        const blockData = {
            'Block type': type,
            'Instance_name': mutation.getAttribute('instance_name'),
        };

        // Handle different block types (method or property)
        if (type === 'component_method') {
            blockData['method_name'] = mutation.getAttribute('method_name');
            blockData['Arguments'] = this.parseArguments(block); // Parse arguments
        } else if (type === 'component_set_get') {
            blockData['PROP'] = block.querySelector('field[name="PROP"]').textContent;
            blockData['set_or_get'] = mutation.getAttribute('set_or_get');
            blockData['value'] = this.parseValue(block.querySelector('value[name="VALUE"]'));
        }

        return blockData;
    }

    // Parse arguments of the block
    parseArguments(block) {
        const args = {};
        block.querySelectorAll('value[name^="ARG"]').forEach((arg) => {
            const argName = arg.getAttribute('name');
            const argBlock = arg.querySelector('block');
            if (argBlock) {
                args[argName] = {
                    type: argBlock.getAttribute('type'),
                    value: this.getBlockValue(argBlock)
                };
            }
        });
        return args;
    }

    // Parse value elements within blocks
    parseValue(valueBlock) {
        if (!valueBlock) return null;
        const block = valueBlock.querySelector('block');
        if (block) {
            return {
                type: block.getAttribute('type'),
                value: this.getBlockValue(block)
            };
        }
        return null;
    }

    // Extract value from a block (handles different types)
    getBlockValue(block) {
        const type = block.getAttribute('type');
        if (type === 'text') {
            return block.querySelector('field[name="TEXT"]').textContent;
        } else if (type === 'component_component_block') {
            return block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent;
        } else if (type === 'component_set_get') {
            return {
                component: block.querySelector('field[name="COMPONENT_SELECTOR"]').textContent,
                property: block.querySelector('field[name="PROP"]').textContent
            };
        }
        return null;
    }
}

// Function to convert XML input to JSON format and display the result
function convertXmlToJson() {
    const xmlInput = document.getElementById('xmlInput').value; // Get the input XML string
    const resultDiv = document.getElementById('result'); // Get the result display element

    try {
        const parser = new AI2XMLParser(xmlInput); // Create a new AI2XMLParser instance
        const result = parser.parse(); // Parse the XML
        resultDiv.textContent = JSON.stringify(result, null, 2); // Display the parsed result as JSON
    } catch (error) {
        resultDiv.textContent = 'Error parsing XML: ' + error.message; // Display error if parsing fails
    }
}
