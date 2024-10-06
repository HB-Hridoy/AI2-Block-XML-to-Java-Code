window.conditionsCodeEditor = CodeMirror.fromTextArea(document.getElementById('conditions-code-editor'), {
    lineNumbers: true,
    mode: 'application/xml',
    theme: 'material',
});

conditionsCodeEditor.setSize(null, 500);

// Load saved conditions and last working XML on page load
window.addEventListener('DOMContentLoaded', function() {
    loadSavedConditions();
    const lastWorkingXML = localStorage.getItem('lastWorkingXML');
    if (lastWorkingXML) {
        conditionsCodeEditor.setValue(lastWorkingXML);
    }
    localStorage.setItem('isConditionsReady', 'false');
});

// Save Condition Template button
document.getElementById('saveConditionTemplate').addEventListener('click', function(event) {
    event.preventDefault();

    const conditionTemplateName = document.getElementById('conditionTemplateName').value.trim();
    const xmlValue = conditionsCodeEditor.getValue();

    if (!isValidXML(xmlValue)) {
        conditionsCodeEditor.setOption('lint', true);
        return;
    }

    if (conditionExists(conditionTemplateName)) {
        showDangerToast(`Template "${conditionTemplateName}" already exists.`);
        //console.log(`Template "${conditionTemplateName}" already exists.`);
        return;
    }

    saveConditionTemplate(conditionTemplateName, xmlValue);
    addConditionToList(conditionTemplateName);
});

// Copy button
document.getElementById('currentConditionCopyButton').addEventListener('click', function() {
    navigator.clipboard.writeText(conditionsCodeEditor.getValue()).then(() => {
        console.log('Condition copied to clipboard.');
    });
    showSuccessToast('Conditions copied to clipboard');
});

// Clear button
document.getElementById('currentConditionClearButton').addEventListener('click', function() {
    conditionsCodeEditor.setValue('');
});

// Delete Condition button
const deleteButton = document.getElementById('deleteSavedConditionButton');
const proceedDeleteSavedConditionButton = document.getElementById('proceedDeleteSavedConditionButton');
proceedDeleteSavedConditionButton.style.display = 'none'; // Hide the button by default

deleteButton.addEventListener('click', function() {
    const selectedCondition = document.getElementById('conditionTemplateName').value;
    deleteCondition(selectedCondition);
    proceedDeleteSavedConditionButton.style.display = 'none'; // Hide after deleting
});

// Function to save condition to localStorage
function saveConditionTemplate(name, xml) {
    const templates = JSON.parse(localStorage.getItem('conditionTemplates') || '{}');
    templates[name] = xml;
    localStorage.setItem('conditionTemplates', JSON.stringify(templates));
    localStorage.setItem('lastWorkingXML', xml); // Save last working XML

    proceedDeleteSavedConditionButton.style.display = 'block'; // Show delete button on select
    showSuccessToast(`Template "${name}" saved successfully`);
}

// Function to load saved conditions into the list
function loadSavedConditions() {
    const templates = JSON.parse(localStorage.getItem('conditionTemplates') || '{}');
    const templateList = document.getElementById('conditions-template-list');

    for (const name in templates) {
        addConditionToList(name);
    }
}

// Function to add a condition to the list
function addConditionToList(name) {
    const templateList = document.getElementById('conditions-template-list');
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" data-drawer-hide="drawer-navigation" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
        <span class="ms-3">${name}</span>
    </a>`;
    templateList.appendChild(li);

    li.addEventListener('click', function() {
        const templates = JSON.parse(localStorage.getItem('conditionTemplates') || '{}');
        const xmlValue = templates[name];
        conditionsCodeEditor.setValue(xmlValue);
        document.getElementById('conditionTemplateName').value = name;
        proceedDeleteSavedConditionButton.style.display = 'block'; // Show delete button on select
    });
}

// Function to check if a condition name already exists
function conditionExists(name) {
    const templates = JSON.parse(localStorage.getItem('conditionTemplates') || '{}');
    return name in templates;
}

// Function to delete a condition from localStorage and the list
function deleteCondition(name) {
    const templates = JSON.parse(localStorage.getItem('conditionTemplates') || '{}');
    if (name in templates) {
        delete templates[name];
        localStorage.setItem('conditionTemplates', JSON.stringify(templates));
    }

    // Remove the condition from the list
    const templateList = document.getElementById('conditions-template-list');
    const listItems = templateList.getElementsByTagName('li');
    for (const li of listItems) {
        if (li.textContent.trim() === name) {
            templateList.removeChild(li);
            break;
        }
    }
    document.getElementById('conditionTemplateName').value = '';
    showSuccessToast(`Condition "${name}" deleted.`);
    //console.log(`Condition "${name}" deleted.`);
}

// Function to validate XML
function isValidXML(xml) {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(xml, "application/xml");
    const errorNode = parsed.querySelector("parsererror");
    if(!errorNode){

    } else {
        showDangerToast('Invalid XML');
    }
    return !errorNode;
}


// Processing conditions
document.getElementById('processConditionButton').addEventListener('click', function() {

    const conditionsXmlString = conditionsCodeEditor.getValue();
    if (isValidXML(conditionsXmlString)) {
        showSuccessToast('Conditions Valid');
         // Parse the conditions XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(conditionsXmlString, "text/xml");

        // Store conditions as an array of objects
        let conditions = Array.from(xmlDoc.getElementsByTagName("condition")).map(condition => ({
            oldValue: condition.getElementsByTagName("oldValue")[0].textContent,
            newValue: condition.getElementsByTagName("newValue")[0].textContent
        }));
        
        // Serialize conditions to JSON before storing in localStorage
        localStorage.setItem('conditions', JSON.stringify(conditions));
        localStorage.setItem('isConditionsReady', 'true');
        showSuccessToast('Conditions Processed Successfully');
    }else{
        showDangerToast('Conditions invalid');
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