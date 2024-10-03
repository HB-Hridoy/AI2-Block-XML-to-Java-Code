const codeEditor = document.getElementById('conditions-code-editor');

window.conditionsCodeEditor = CodeMirror.fromTextArea(codeEditor, {
    lineNumbers: true,
    mode: 'application/xml',
    theme: 'material',
});

conditionsCodeEditor.setSize(null, 500);