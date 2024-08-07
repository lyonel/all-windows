import St from 'gi://St';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const WindowList = GObject.registerClass(
class WindowList extends PanelMenu.Button {

	_init() {
		super._init(0.0, 'All Windows');

		this.add_child(new St.Icon({ icon_name: 'view-grid-symbolic', style_class: 'system-status-icon' }));
        	this.updateMenu();

		this._restacked = global.display.connect('restacked', () => this.updateMenu());
	}

	destroy() {
		global.display.disconnect(this._restacked);
        	super.destroy();
    	}

	
    updateMenu() {
        this.menu.removeAll();
        let empty_menu = true;

            let tracker = Shell.WindowTracker.get_default();

            for ( let wks=0; wks<global.workspace_manager.n_workspaces; ++wks ) {
                // construct a list with all windows
                let workspace_name = Meta.prefs_get_workspace_name(wks);
                let metaWorkspace = global.workspace_manager.get_workspace_by_index(wks);
                let windows = metaWorkspace.list_windows();             
                let sticky_windows = windows.filter(
                        function(w) {
                            return !w.is_skip_taskbar() && w.is_on_all_workspaces();
                            }
                                        );
                windows = windows.filter(
                        function(w) {
                            return !w.is_skip_taskbar() && !w.is_on_all_workspaces();
                            }
                                        );

                if(sticky_windows.length && (wks==0)) {
                    for ( let i = 0; i < sticky_windows.length; ++i ) {
                        let metaWindow = sticky_windows[i];
                        let item = new PopupMenu.PopupMenuItem('');
                        item.connect('activate', () => this.activateWindow(metaWorkspace, metaWindow));
                        item._window = sticky_windows[i];
                        let app = tracker.get_window_app(item._window);
			let box = new St.BoxLayout( { x_expand: true  } );
                        item._icon = app.create_icon_texture(24);
			if(box.add) {
				box.add(new St.Label({ text: ellipsizedWindowTitle(metaWindow), x_expand: true }));
				box.add(new St.Label({ text: ' ' }));
				box.add(item._icon);
			} else {
				box.add_child(new St.Label({ text: ellipsizedWindowTitle(metaWindow), x_expand: true }));
				box.add_child(new St.Label({ text: ' ' }));
				box.add_child(item._icon);
			}
			if(item.add_actor) {
                                item.add_actor(box);
			} else {
                                item.add_child(box);
			}
                        this.menu.addMenuItem(item);
                        empty_menu = false;
                    }
                        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
                }

                if(windows.length) {
                    if(wks>0) {
                        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
                    }
                    if(global.workspace_manager.n_workspaces>1) {
                        let item = new PopupMenu.PopupMenuItem(workspace_name);
                        item.reactive = false;
                        item.can_focus = false;
                        if(wks == global.workspace_manager.get_active_workspace().index()) {
                            item.setOrnament(PopupMenu.Ornament.DOT);
                        }
                        this.menu.addMenuItem(item);
                        empty_menu = false;
                    }


                    for ( let i = 0; i < windows.length; ++i ) {
                        let metaWindow = windows[i];
                        let item = new PopupMenu.PopupMenuItem('');
                        item.connect('activate', () => this.activateWindow(metaWorkspace, metaWindow));
                        item._window = windows[i];
                        let app = tracker.get_window_app(item._window);
			let box = new St.BoxLayout( { x_expand: true  } );
                        item._icon = app.create_icon_texture(24);
                        if(box.add) {
				box.add(new St.Label({ text: ellipsizedWindowTitle(metaWindow), x_expand: true }));
				box.add(new St.Label({ text: ' ' }));
				box.add(item._icon);
			} else {
				box.add_child(new St.Label({ text: ellipsizedWindowTitle(metaWindow), x_expand: true }));
				box.add_child(new St.Label({ text: ' ' }));
				box.add_child(item._icon);
			}
			if(item.add_actor) {
                                item.add_actor(box);
			} else {
                                item.add_child(box);
			}
                        this.menu.addMenuItem(item);
                        empty_menu = false;
                    }
                }
            }

        if (empty_menu) {
            let item = new PopupMenu.PopupMenuItem(_("No open windows"))
            item.reactive = false;
            item.can_focus = false;
            this.menu.addMenuItem(item);

            this.hide();
        }
	else {
	    this.show();
	}
    }

    activateWindow(metaWorkspace, metaWindow) {
        if(!metaWindow.is_on_all_workspaces()) { metaWorkspace.activate(global.get_current_time()); }
        metaWindow.unminimize();
        metaWindow.activate(0);
    }

     _onButtonPress(actor, event) {
        this.updateMenu();
        this.parent(actor, event);
    }

});

function ellipsizeString(s, l){
    if(s.length > l) { 
        return s.substr(0, l)+'...';
    }
    return s; 
}

function ellipsizedWindowTitle(w){
    return ellipsizeString(w.get_title()||"-", 100);
}

export default class AllWindowsExtension extends Extension {
    enable() {
        this._windowlist = new WindowList();
        Main.panel.addToStatusArea(this.uuid, this._windowlist, -1, 'right');
    }

    disable() {
        this._windowlist.destroy();
        this._windowlist = null;
    }
}
