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
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, PathUtils, window */

define(function (require, exports, module) {
    "use strict";
    
    var Commands            = brackets.getModule("command/Commands");
    var KeyEvent            = brackets.getModule("utils/KeyEvent");
    var ModalBar            = brackets.getModule("widgets/ModalBar").ModalBar;
    var Menus               = brackets.getModule("command/Menus");
    var EditorManager       = brackets.getModule("editor/EditorManager");
    var CommandManager      = brackets.getModule("command/CommandManager");
    
    var EDIT_WRAP_TAGS = "edit_wrap_tags";
    
    var currentQuery = "";

    function WrapTagsDialog() {
        this.closed = false;
    }
    
    
    /**
    * Closes the search dialog and resolves the promise that showDialog returned
    */
    WrapTagsDialog.prototype._close = function (value) {
        if (this.closed) {
            return;
        }
        
        this.closed = true;
        this.modalBar.close();
        EditorManager.focusEditor();
        this.result.resolve(value);
    };
    
    WrapTagsDialog.prototype.showDialog = function () {
        var dialogHTML = "Wrap tag: " +
            ": <input type='text' id='wrapTagsInput' style='width: 10em'> &nbsp;" +
            "<div class='message'></div><div class='error'></div>";
        
        this.modalBar = new ModalBar(dialogHTML, false);
        var $searchField = $("input#wrapTagsInput");
        this.result = new $.Deferred();
        var that = this;
        
        $searchField.bind("keydown", function (event) {
            if (event.keyCode === KeyEvent.DOM_VK_RETURN || event.keyCode === KeyEvent.DOM_VK_ESCAPE) {  // Enter/Return key or Esc key
                event.stopPropagation();
                event.preventDefault();
                
                var query = $searchField.val();
                
                if (event.keyCode === KeyEvent.DOM_VK_ESCAPE) {
                    query = null;
                }
                
                that._close(query);
            }
        })
            .bind("input", function (event) {
                
            })
            .blur(function () {
                that._close(null);
            })
            .focus();
        
        return this.result.promise();
    };
    
    function wrapTags(editor) {
        editor = editor || EditorManager.getFocusedEditor();
        console.log(editor.getModeForDocument());
//        if (editor.getModeForDocument() === "htmlmixed") { // "text/x-brackets-html"
        var dialog = new WrapTagsDialog();
        var selectedText = editor.getSelectedText();
        currentQuery = "";
            
        dialog.showDialog()
            .done(function (query) {
                if (query) {
                    currentQuery = query;
                    var regex = /<(\w+)(>|\s+[^>]*>)/;
                    var arrMatches = regex.exec(currentQuery);
                    console.log(arrMatches);
                    editor._codeMirror.replaceSelection(currentQuery + selectedText + "</" + arrMatches[1] + ">");
                }
            });
//        }
        return;
    }
       
   
    
    
    
    CommandManager.register("Wrap Tags", EDIT_WRAP_TAGS, wrapTags);
    
	var windowsCommand = {
		key: "Ctrl-Shift-W",
		platform: "win"
	};

	var macCommand = {
		key: "Ctrl-Shift-W",
		platform: "mac"
	};

	var command = [windowsCommand, macCommand];
    
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(EDIT_WRAP_TAGS, command);
    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(EDIT_WRAP_TAGS, command);
});