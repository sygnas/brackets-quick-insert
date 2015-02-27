/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 *
 */

define(function (require, exports, module) {
    
    'use strict';
        
    // Brackets modules
    var DocumentManager     = brackets.getModule("document/DocumentManager"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        KeyEvent            = brackets.getModule("utils/KeyEvent"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils");

    var data = JSON.parse(require("text!data.json")),
        keyCodeMap = JSON.parse(require("text!keycode.json")).keyCode;

    var currentDoc,
        editor,
        dropBase,
        dropDialog;

    /*****************************
    * init
    */
    function init(){
        dataNormalize();
        KeyBindingManager.addGlobalKeydownHook(_keydownHook);
        initDropDialog();
    }

    /*****************************
    * add eventkey to userdata
    */
    function dataNormalize(){
        var name,key,
            item,
            itemKeys;

        for( name in data.insertItems ){
            item = data.insertItems[name];
            itemKeys = item.keys;

            item.useCtrlKey = $.inArray('CTRL',itemKeys) < 0 ? false : true;
            item.useShiftKey = $.inArray('SHIFT',itemKeys) < 0 ? false : true;
            item.useAltKey = $.inArray('ALT',itemKeys) < 0 ? false : true;

            for(var i=0; i<itemKeys.length; i++){
                key = itemKeys[i];
                if(key==='CTRL' || key==='SHIFT' || key==='ALT') continue;
                item.useCharaKey = key;
                break;
            }
        }
    }

    /*****************************
    * drop dialog initialize
    */
    function initDropDialog(){
        // css
        var styleUrl = ExtensionUtils.getModulePath(module, "default.css");
        var style = $('<link rel="stylesheet" type="text/css" />');
        $(document.head).prepend(style);
        $(style).attr('href', styleUrl);

        // html
        var dialogHtml = [
            '<div id="syg-quick-insert" style="display:none">',
            '<div class="inner">',
            '<div class="drop-area">',
            '<p class="body">drop file</p>',
            '<p class="foot"><button class="dialog-button btn primary">CANCEL</button></p>',
            '</div></div></div>'
        ].join('');
        $('body').append(dialogHtml);

        dropBase = $('#syg-quick-insert');
        dropDialog = $('#syg-quick-insert .drop-area');

        $('.btn', dropBase).click(hideDialog);
        dropDialog.on('dragenter', _handleDragEnter);
        dropDialog.on('dragleave', _handleDragLeave);
        dropDialog.on('drop', _handleDrop);
    }

    function showDialog(){
        dropBase.show();
        dropDialog.addClass('modal');
    }
    function hideDialog(){
        dropDialog.removeClass('modal');
        dropBase.hide();
    }

    /******************************
    * drag and drop handle
    */
    function _handleDrop(e){

        var files = e.originalEvent.dataTransfer.files,
            docPath =currentDoc.file._parentPath,
            relativeFilename;

        if(files && files.length){
            e.stopPropagation();
            e.preventDefault();

            brackets.app.getDroppedFiles(function(err, paths){
                if(!err){
                    relativeFilename = abspath2rel( docPath, paths[0] );
                    doInsert({text:relativeFilename});
                    hideDialog();
                }
            });
        }
    }
    function _handleDragEnter(e){
        e.stopPropagation();
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        dropDialog.addClass('isDragOver');
    }
    function _handleDragLeave(e){
        e.stopPropagation();
        e.preventDefault();
        dropDialog.removeClass('isDragOver');
    }

    /**************************
    * convert absolute path to relative path
    * http://d.hatena.ne.jp/seuzo/20090704/1246633340
    */
    function abspath2rel(base_path, target_path) {
        var tmp_str = '';
        base_path = base_path.split('/');
        base_path.pop();
        target_path = target_path.split('/');
        while(base_path[0] === target_path[0]) {
            base_path.shift();
            target_path.shift();
        }
        for (var i = 0; i< base_path.length; i++) {
            tmp_str += '../';
        }
        return tmp_str + target_path.join ('/');
    }

    /*****************************
    * key hook
    */
    function _keydownHook(event) {

        currentDoc = DocumentManager.getCurrentDocument();
        if(!currentDoc) return false;

        editor = EditorManager.getCurrentFullEditor();
        if(!editor) return false;

        if (handleKey(event)) {
            event.stopPropagation();
            event.preventDefault();
            return true;
        }
        
        // If we didn't handle it, let other global keydown hooks handle it.
        return false;
    }

    /*****************************
    * insert items
    */
    function handleKey(event, testDocument, testEditor) {
        var insertItem,
            hit = false;

        // if press ctrl, shift, alt, return then return
        switch(event.keyCode){
            case KeyEvent.DOM_VK_CONTROL: return false;
            case KeyEvent.DOM_VK_SHIFT: return false;
            case KeyEvent.DOM_VK_ALT: return false;
            default:
        }

        // check target
        for(name in data.insertItems){
            insertItem = data.insertItems[name]
 
            if(isTargetItem(insertItem, event)){

                if(insertItem.type === 'text'){
                    doInsert(insertItem);
                    return true;
                }else if(insertItem.type === 'drop'){
                    doDropInsert();
                    return true;
                }
                break;
            }
        }
    }

    function isTargetItem(insertItem, event){
        var keys = insertItem.keys,
            ctrlKey = (brackets.platform === "mac") ? event.metaKey : event.ctrlKey,
            charaKeyCode = keyCodeMap[insertItem.useCharaKey];

        if(insertItem.useCtrlKey && !ctrlKey) return false;
        if(!insertItem.useCtrlKey && ctrlKey) return false;
        if(insertItem.useShiftKey && !event.shiftKey) return false;
        if(!insertItem.useShiftKey && event.shiftKey) return false;
        if(insertItem.useAltKey && !event.altKey) return false;
        if(!insertItem.useAltKey && event.altKey) return false;
        if(charaKeyCode!==event.keyCode) return false;

        return true;
    }

    /*****************************
    * drop insert url
    */
    function doDropInsert(){
        showDialog();
    }

    /*****************************
    * insert
    */
    function doInsert(insertItem) {
        var selections = editor.getSelections(),
            edits = [];

        selections.forEach(function(sel){
            queueEdits(edits, getEdits(sel, insertItem));
        });

        // batch for single undo
        currentDoc.batchOperation(function () {
            // perform edits
            selections = editor.document.doMultipleEdits(edits);
            editor.setSelections(selections);

            // indent lines with selections
            selections.forEach(function (sel) {
                if (!sel.end || sel.start.line === sel.end.line) {
                // The document is the one that batches operations, but we want to use
                // CodeMirror's indent operation. So we need to use the document's own
                // backing editor's CodeMirror to do the indentation.
                    currentDoc._masterEditor._codeMirror.indentLine(sel.start.line);
                }
            });
        });
    }

    function getEdits(sel, insertItem){
        var newTagPair = insertItem.text.split("|");

        var selText = currentDoc.getRange(sel.start, sel.end),
            openTag = newTagPair[0],
            closeTag = newTagPair.length === 2 ? newTagPair[1] : "",
            insertString = openTag + selText + closeTag,
            replSelEnd = $.extend({}, sel.end);

        // reset selection
        var selNewStart = $.extend({}, sel.start),
            selNewEnd   = $.extend({}, sel.end);

        selNewStart.ch += openTag.length;
        if (sel.start.line === sel.end.line) {
            selNewEnd.ch += openTag.length;
        }
 
        return {
            edit: {text: insertString, start: sel.start, end: replSelEnd},
            selection: {start: selNewStart, end: selNewEnd, primary: sel.primary, isBeforeEdit: false}
        };
    }

    function queueEdits(edits, val){
        if (val) {
            if (Array.isArray(val)) {
                val.forEach(function (v) {
                    edits.push(v);
                });
            } else {
                edits.push(val);
            }
        }
    }


    init();


});