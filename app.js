Ext.application({
    name: 'AM',

    appFolder: 'app',

    launch: function() {
        var file_menu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'New',
            }, {
                text: 'Open'
            }, {
                text: 'Open Recent',
                menu: {
                    items: [{
                        text: 'editor/index.html'
                    }, {
                        text: 'editor/app.js'
                    }, '-', {
                        text: 'Clear Items'
                    }]
                }
            }, '-', {
                text: 'Save'
            }, {
                text: 'Save As'
            }, {
                text: 'Save All'
            }, '-', {
                text: 'Close'
            }, {
                text: 'Close All'
            }, {
                text: 'Close Others'
            }, '-', {
                text: 'Exit'
            }]
        });

        var edit_menu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Undo',
            }, {
                text: 'Redo'
            }, '-', {
                text: 'Cut'
            }, {
                text: 'Copy'
            }, {
                text: 'Paste'
            }, {
                text: 'Delete'
            }, {
                text: 'Select All'
            }, '-', {
                text: 'Line',
                menu: {
                    items: [{
                        text: 'Indent'
                    }, {
                        text: 'Unindent'
                    }]
                }
            }, {
                text: 'Comment',
                menu: {
                    items: [{
                        text: 'Toggle Comment'
                    }, {
                        text: 'Toggle Block Comment'
                    }]
                }
            }]
        });

        var find_menu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Find'
            }, {
                text: 'Find Next'
            }, {
                text: 'Find Previous'
            }, '-', {
                text: 'Replace'
            }, {
                text: 'Replace Next'
            }, {
                text: 'Replace Previous'
            }, {
                text: 'Replace All'
            }]
        });

        var preferences_menu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Settings'
            }, {
                text: 'Syntax',
                menu: {
                    items: [{
                        text: 'C'
                    }, {
                        text: 'C++'
                    }, {
                        text: 'C#'
                    }, {
                        text: 'Java'
                    }, {
                        text: 'PHP'
                    }, {
                        text: 'Python'
                    }]
                }
            }]
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            region: 'north',
        });

        toolbar.add({
            text: 'File',
            menu: file_menu
        }, {
            text: 'Edit',
            menu: edit_menu
        }, {
            text: 'Find',
            menu: find_menu
        }, {
            text: 'Preferences',
            menu: preferences_menu
        });

        var store = Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: 'get-nodes.php'
            },
            folderSort: true,
            sorters: [{
                property: 'text',
                direction: 'ASC'
            }]
        })

        var tree = Ext.create('Ext.tree.Panel', {
            animate: true,
            store: store,
            rootVisible: false,
            title: 'Folders',
            region: 'west',
            collapsible: true,
            split: true,
            height: 600,
            width: 300
        });

        tree.on('itemclick', function(treeview, record, item, index, e, opts) {
            /** 取消双击展开折叠菜单行为 */
            treeview.toggleOnDblClick = false;

            if (record.get('leaf')) {
                var moduleId = record.get('id');
                application.loadModule(moduleId);
                var module = application.getController(moduleId);

                /**
                 * @tip
                 * 一个控制器第一个视图为模块主功能视图
                 */
                var viewName = module.views[0];
                var view = module.getView(viewName);

                /***
                 * 视图结构: 目录为模块包名, 目录内文件为模块名, 视图类型为小写的模块名.
                 * @example
                 * App.viw.theme.Theme
                 * alias : 'widget.theme'
                 *
                 * viewType: theme
                 */
                var viewType = viewName.split('.')[1].toLowerCase();

                /**
                 * 如果没有此视图, 创建视图.
                 */
                if (!tabpanel.down(viewType)) {
                    var panel = view.create();
                    tabpanel.add(panel);
                    tabpanel.setActiveTab(panel);
                    panel.doLayout();
                }
                /**
                 * 如果有此视图, 刷新视图.
                 */
                else {
                    var panel = tabpanel.down(viewType);
                    tabpanel.setActiveTab(panel);
                    panel.doLayout();
                }
            } else {
                treeview.toggle(record);
            }
        });
        Ext.Loader.setConfig({enabled: true});
        Ext.Loader.setPath('Ext.ux', 'extjs/examples/ux');
        Ext.require([
        'Ext.tip.QuickTipManager',
        'Ext.tab.Panel',
        'Ext.ux.TabScrollerMenu',
        'Ext.ux.TabReorderer',
        'Ext.ux.TabCloseMenu',
        'Ext.ux.GroupTabPanel'
        ]);
        var tab = Ext.widget('tabpanel', {
            region: 'center',
            height: 600,
            width: 700,
            defaults: {
                closable: true
            },
            plugins: Ext.create("Ext.ux.TabReorderer"),
            items: [{
                title: 'app.js',
                html: '<div id="editor">function foo(items) {\
    var x = "All this is syntax highlighted";\
    return x;\
}</div>'
            }, {
                title: 'index.html'
            }, {
                title: 'ace.js'
            }, {
                title: 'style.css'
            }, {
                title: 'index.php'
            }]
        });

        var viewport = Ext.create('Ext.Viewport', {
            layout: 'border',
            renderTo: Ext.getBody(),
            items: [toolbar, {
                layout: 'border',
                region: 'center',
                // items: [tree, panel],
                items: [tree, tab],
                height: 1000
            }]
        });

        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/dawn");
        editor.getSession().setMode("ace/mode/php");
    }
});