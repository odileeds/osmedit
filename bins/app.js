var app;

(function(root){

	var osmedit;


	// Do we update the address bar?
	var pushstate = !!(window.history && history.pushState);
	var requirelogin = true;

/*
	function receiveMessage(event) {
		console.log('Received message from '+event.origin,event);
		//if(event.origin && event.origin !== "https://odileeds.github.io" && event.origin !== "https://odileeds.org") return;

		S('#message').append('<div><strong>Received data from '+event.data.referer+'</strong></div>').addClass('loaded');
		
		if(event.data.referer=="DecisionTree") app.setTreeType(event.data.tree);

		return;
	}

	window.addEventListener("message", receiveMessage, false);
*/
	
	function Application(opts){

		this.opts = opts;
		this.name = (opts.name||"ODI Leeds Editor");
		this.log = new Logger({'id':this.name,'logging':(location.search.indexOf("logging=true")>=0)});
		this.data = {};
		requirelogin = (typeof opts.requirelogin==="boolean" ? opts.requirelogin: true);

		// Add event to change of push state
		window[(pushstate) ? 'onpopstate' : 'onhashchange'] = function(e){
			console.log('on',location.hash);
			var hash = location.hash || "#intro";
			setScreen(hash);
		};
		
		this.message = function(msg,attr){
			if(msg) this.log.message(msg);

			var msgel = S('#messages');
			
			if(!attr) attr = {'id':'default'};
			if(!msg){
				if(msgel.length > 0){
					// Remove the specific message container
					if(msgel.find('#'+attr.id).length > 0) msgel.find('#'+attr.id).remove();
					// Remove the whole message container if there is nothing left
					if(msgel.html()==""){
						msgel.parent().css({'padding-bottom':''});
						msgel.remove();
					}
				}
			}else if(msg){
				// If there is no message container, we make that now
				if(msgel.length == 0){
					S('#main').append('<div id="messages" class="theme"></div>');
					msgel = S('#messages');
				}
				// We make a specific message container
				if(msgel.find('#'+attr.id).length==0) msgel.append('<div id="'+attr.id+'"></div>');
				msgel = msgel.find('#'+attr.id);
				msgel.html(msg);
			}

			return this;
		};

		this.init = function(){

			// Create an OSM Editor instance
			osmedit = new OSMEditor();
			this.osmedit = osmedit;

			// Attach the map to a div with id=location
			osmedit.addMap('location');

			// Set the named markers
			osmedit.mapper.setMarkers({
				'waste':{'svg':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42"><path style="fill:%COLOR%;fill-opacity:1" d="M 16 42 L 3,34 3,7 0,7 0,4 8,4 10,0 22,0 24,4 21,4 20,2 12,2 11,4 32,4 32,7 29,7 29,11 29,34 Z" /><path style="fill:#999999;fill-opacity:1" d="M 8,11 l 0,19 3,0 0,-19 -3,0 m 6.5,0 l 0,19 3,0 0,-19 -3,0 m 6.5,0 l 0,19 3,0 0,-19 -3,0" /></svg>','color':'white','background':'black'},
				'recycling':{'svg':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42"><path style="fill:#0DBC37;fill-opacity:1" d="M 16 42 L 3,34 3,7 0,7 0,4 8,4 10,0 22,0 24,4 21,4 20,2 12,2 11,4 32,4 32,7 29,7 29,34 Z" /><path style="fill:#ffffff;fill-opacity:1" d="M 15 26 l 4,4 0,-2 4,0 4,-6 -3,-5 -2,1 2,4 -2,3 -3,0 0,-2 Z m -1,-1 l 0,3 -4,0 -4,-6 2,-3 -2,-1 4,-1 2,4 -2,-1 -1,2 2,3 z m -2,-8 l -3,-2 4,-5 5,0 3,3 2,-2 0,6 -6,0 2,-2 -2,-2 -3,0" /></svg>','color':'white','background':'#0DBC37'},
				'beverage':{'svg':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42"><path style="fill:#F9BC26;fill-opacity:1" d="M 16 42 L 3,34 3,12 C 6 0, 26 0, 29 12 L 29,12 L 29,34 Z" /><path style="fill:#D60303;fill-opacity:1" d="M 16 34 l -5,0 0,-5 1,-1 0,-8 -1,-1 0,-4 c 0 -2, 2 -4, 4 -4 l 0,-1 -1,0 0,-4 4,0 0,4 -1,0 0,1 c 2 0, 4 2, 4 4 l 0,4 -1,1 0,8 1,1 0,5 Z" /></svg>','color':'white','background':'#F9BC26'},
				'paper':{'svg':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42"><path style="fill:#00ace8;fill-opacity:1" d="M 16 42 L 3,34 3,7 0,7 0,4 8,4 10,0 22,0 24,4 21,4 20,2 12,2 11,4 32,4 32,7 29,7 29,34 Z" /><path style="fill:#ffffff;fill-opacity:1" d="M 9,31 l 0,-21 9,0 0,6 6,0 0,2 -12,0 0,2 9,0 0,-2 3,0 0,4 -12,0 0,2 9,0 0,-2 3,0 0,4 -12,0 0,2 9,0 0,-2 3,0 0,5 z m 15,-16 l -5,0 0,-5 z" /></svg>','background':'#00ace8'},
				'glass':{'svg':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42"><path style="fill:#1DD3A7;fill-opacity:1" d="M 16 42 L 3,34 3,12 C 6 0, 26 0, 29 12 L 29,12 L 29,34 Z" /><path style="fill:#ffffff;fill-opacity:1" d="M 16 32 l -5,0 0,-10 c 0 -4, 4 -6, 4 -14 l 2,0 c 0 6, 4 10, 4 14 l 0,10 Z" /></svg>','background':'#1DD3A7'},
				'battery':{'svg':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42"><path style="fill:#1DD3A7;fill-opacity:1" d="M 16 42 l -13,-8 0,-26 6,0 0,-5 14,0 0,5 6,0 0,26 Z" /><path style="fill:#ffffff;fill-opacity:1" d="M 12 30 l 9,0 0,-3 -9,0 z M 14.5 13 l 0,-3 3,0 0,3 3,0 0,3 -3,0 0,3 -3,0 0,-3 -3,0 0,-3" /></svg>','background':'#1DD3A7'}
			});

			// Set the default marker type
			osmedit.mapper.setMarker('waste');

			// Add login/logout events
			osmedit.on('login',{me:this},function(e){

				html = "";
				if(e.authenticated) S('#auth').addClass('logged-in');			
				else S('#auth').removeClass('logged-in');
				
				S('.user .name').html(this.user.name||"?");
				S('.user .id').html(this.user.id||"?");
				S('.user .changesets').html(this.user.changesets||0);
				if(this.user.img) S('.user img').attr('src',this.user.img);
				S('#login').css({'display':'none'});
			
			}).on('logout',{me:this},function(e){

				S('#auth').removeClass('logged-in');
				S('.user .name').html(this.user.name||"?");
				S('.user .id').html(this.user.id||"?");
				S('.user .changesets').html(this.user.changesets||0);
				S('.user img').attr('src','resources/unknown.png');
				S('body').removeClass('side-panel-open');
				
			});

			// Bind functions to the "Add a bin" button
			S('#btn-add-item').on('click',{me:this},function(e){ e.data.me.addItem(); });

			S('#btn-save-item').on('click',{me:this},function(e){
				e.data.me.saveItem();
			});
			S('#btn-save-details').on('click',{me:this},function(e){
				e.data.me.saveItem();
			});
			
			S('#btn-publish').on('click',{me:this},function(e){
				console.log('test');
				// Hide the publish button
				S('#btn-publish').css({'display':'none'});
				e.data.me.publish();
			});

			S('#logout').on("click",function(e){
				osmedit.logout();
			});
			S('#user').on('click',function(e){
				this.parent().toggleClass('open');
				S('body').toggleClass('side-panel-open');
			});

			// Do a check to see if we are already logged in
			osmedit.getUserDetails();
			
			var sections = S('#main section');
			for(var i = 1; i < sections.length; i++){
				S(sections[i]).css({'display':'none'});
			}
			
			S('.bg').on('click',function(e){
				S('#hamburger')[0].checked = false;
			});
			
			S('header nav a').on('click',{me:this},function(e){
				//e.preventDefault();
				setScreen(S(e.currentTarget).attr('href'))
			});
			
			
			// Build map style selector
			var opts = "";
			var o = osmedit.mapper.getLayers();
			var selected = 0;
			for(var i = 0; i < o.length; i++){
				if(osmedit.mapper.selectedLayer == o[i].id) selected = i;
				opts += '<option value="'+o[i].id+'"'+(selected == i ? ' selected="selected"':'')+'>'+o[i].id+'</option>';
			}
			S('#layerSelect').html(opts);
			S('#layerSelected').attr('src',o[selected].url.replace("{z}",18).replace("{x}",129954).replace("{y}",84421).replace("{r}","").replace("{s}","a"));
			S('#layerSelect').on('change',function(e){
				console.log('change',e.currentTarget.value);
				osmedit.mapper.changeLayer(e.currentTarget.value);
				var l = osmedit.mapper.getLayer();
				S('#layerSelected').attr('src',l.url.replace("{z}",18).replace("{x}",129954).replace("{y}",84421).replace("{r}","").replace("{s}","a"));
			});

			var _obj = this;
			osmedit.mapper.callbacks.geostart = function(e){
				_obj.message('Finding location...');
			};
			osmedit.mapper.callbacks.geoend = function(e){
				_obj.message('');
			};
			osmedit.mapper.callbacks.updatenodes = function(){
				S('#loader').css({'display':'none'});
			};
			osmedit.mapper.callbacks.popupopen = function(e){
				id = e.target.osmid;
				console.log('popupopen',id,_obj.action);
				if(_obj.action == "adding"){
					osmedit.mapper.map.closePopup();
				}else{
					if(osmedit.mapper.nodes[id]){
						osmedit.mapper.activeNode = osmedit.mapper.nodes[id];
						_obj.setView('popupopen');
					}
				}
			};
			// Moving the map we remove the helper balloon
			osmedit.mapper.callbacks.movestart = function(e){
				S('#add-item .balloon').remove();
			};
			// When the popup is closed we stop editing mode
			osmedit.mapper.callbacks.popupclose = function(e){
				if(_obj.action=="adding"){
				}else _obj.setView('popupclose');
				
				osmedit.mapper.activeNode = {};
			};
			
			osmedit.setNode({
				'type':['amenity=waste_basket','amenity=recycling']
			});

			S('#loader .label').html('Loading bins...');



			osmedit.getNodes({
				'overpass':true,
				'popup': function(){
					var str,cls,title,types,p,i,ts;
					str = '';
					cls = '';
					ico = '';
					title = 'Bin';
					types = {};
					ts = 0;
					if(this.props.amenity){
						if(this.props.amenity=="waste_basket"){
							title = "Waste";
							cls = "waste";
							ico = "waste";
						}else{
							for(t in this.props){
								if(t.indexOf("recycling:")==0){
									types[t] = this.props[t];
								}
							}
							ts = Object.keys(types).length;
							title = "Recycling";
							cls = "recycling";
							ico = "recycling";
							// If only one type of recycling pick that bin
							if(ts==1){
								if(types['recycling:beverage_cartons']){ ico = "beverage"; cls += ' beverage'; }
								if(types['recycling:paper']){ ico = "paper"; cls += " paper"; }
								if(types['recycling:glass_bottles']){ ico = "glass"; cls += ' glass'; }
							}
						}
					}
					i = 0;
					for(p in _obj.data.tags){
						if(_obj.data.tags[p] && this.props[p]){
							str += (str ? ', ':'')+(ts > 1 && i == ts-1 ? 'and ':'')+((_obj.data.tags ? _obj.data.tags[p].label:p)||p)+(this.props[p] != "yes" ? ": "+this.props[p]:"");
							i++;
						}
					}
					return {'label':'<h3>'+title+'</h3><p class="id">'+this.id+'</p>'+(str ? '<p>'+str+'</p>':''), 'options':{'className':cls,'icon':ico}};
				}
			});
			
			this.changes = [];

			S('#init').remove();

			if(location.hash) setScreen(location.hash);
			else setScreen('#intro');
			
			return this;
		}


		// Publish/checkout
		this.publish = function(){
			if(!osmedit.changeset) osmedit.startChangeSet({'comment':'Adding some bins','hashtags':'#ODIbins','host':'https://odileeds.org/projects/osmedit/bins/'});
			console.log('add bins to changeset here',this);
			osmedit.closeChangeSet();
		}



		// Log in process
		this.login = function(){
			
			// Show pre-login screen
			S('#login').css({'display':''});
			S('#login .close').on('click',function(e){
				S('#login').css({'display':'none'});
			});
	
			// Login
			S('#btn-login').on('click',function(e){
				console.log('clicked');
				osmedit.login();
			});
			
			return this;
		}


		// Add an item (may require login
		this.addItem = function(){
			if((osmedit.user && osmedit.user.name) || !requirelogin){
				this.startAdd();
				return this;
			}else{
				return this.login();
			}
		}

		this.setButton = function(name,state){
			state = (state=="off" ? 'none':'');
			id = "";
			if(name=="publish") id = '#btn-publish-item';
			else if(name=="save") id = '#btn-save-item';
			else if(name=="edit") id = '#btn-edit-item';
			else if(name=="delete") id = '#btn-delete-item';
			
			if(id) S(id).css({'display':state});
			else console.error('No valid button given for '+name);

			return this;
		}


		// Save an item (equivalent to an "add to basket")
		this.saveItem = function(){
			console.log('saveItem',this,osmedit.mapper.map.getCenter());

			// Enable/disable buttons
			this.setButton("publish","on");
			this.setButton("save","off");
			this.setButton("edit","off");
			this.setButton("delete","off");
			
			// Remove placeholder bin if one exists
			if(S('#add-item').length > 0){
				S('#add-item').remove();
			}
			
			// Add bin properly

			// Get properties
			var genus = document.querySelector('#genus').getAttribute('data-genus');
			var vernac = document.querySelector('#genus').getAttribute('data-vernacular');
			var taxon = document.querySelector('#genus').getAttribute('data-taxon');
			var height = parseFloat(document.querySelector('#height').value);
			var circ = parseFloat(document.querySelector('#circumference').value);


			var item = {
				'lat':osmedit.mapper.map.getCenter().lat,
				'lon':osmedit.mapper.map.getCenter().lng,
				'natural':'tree',
				'source':'survey'
			};
			if(genus) tree['genus'] = genus;
			if(vernac) tree['species:en'] = vernac;
			if(taxon) tree['species'] = taxon;
			tree['leaf_type'] = 'broadleaved';
			tree['leaf_cycle'] = 'deciduous';
			if(!isNaN(height) && height > 0) tree['height'] = height;
			if(!isNaN(circ) && circ > 0) tree['cirumference'] = circ;
			
			if(osmedit.changeset){

				var content = '<?xml version="1.0" encoding="UTF-8"?><osm>';
				content += '<node changeset="'+osmedit.changeset.id+'" lat="'+osmedit.mapper.map.getCenter().lat.toFixed(5)+'" lon="'+osmedit.mapper.map.getCenter().lng.toFixed(5)+'">';
				content += '<tag k="natural" v="tree"/>';
				content += '<tag k="source" v="survey"/>';
				if(genus) content += '<tag k="genus" v="'+genus+'"/>';
				if(vernac) content += '<tag k="species:en" v="'+vernac+'"/>';
				if(taxon) content += '<tag k="species" v="'+taxon+'"/>';

				content += '<tag k="leaf_type" v="broadleaved"/>';
				content += '<tag k="leaf_cycle" v="deciduous"/>';
				if(!isNaN(height) && height > 0) content += '<tag k="height" v="'+height+'"/>';
				//content += '<tag k="name" v=""/>';
				if(!isNaN(circ) && circ > 0) content += '<tag k="circumference" v="'+circ+'"/>';
				content += '</node></osm>';
console.log(content);


				// Add a new node
				osmedit.addNode(content);

				// Alternatively we update an existing node


				// Need to add the tree to the map
				
				// "Delete the item" (resets the interface)
				this.deleteItem();
				
				this.setView('save');

			}else{
				osmedit.log.message('No changeset open');
			}
		}


		// Delete an item
		this.deleteItem = function(){
			this.action = "";
			this.setView('done');
			return this;
		}


		this.setView = function(v){

			if(!v) v = this.action;

			console.log('setting view to '+v);

			S('#splash').css({'display':'none'});

			if(v == "map"){
				S('#app').css({'display':'block'});
				S('#map').css({'display':'block'}).trigger('resize');
			}else if(v == "edit"){
				S('#add-item').css({'display':'none'});
				S('.screen').css({'display':'none'});
				S('#details').css({'display':''});
				S('#helper').css({'display':'none'});
			}else if(v == "add"){
				S('#btn-add-item').css({'display':'none'});
				S('#btn-delete-item').css({'display':''});
				S('#btn-edit-item').css({'display':''});
				S('#btn-save-item').css({'display':''});
				S('#add-item').remove();
			}else if(v == "done"){
				S('#btn-add-item').css({'display':''});
				S('#btn-delete-item').css({'display':'none'});
				S('#btn-edit-item').css({'display':'none'});
				S('#btn-save-item').css({'display':'none'});
				S('#add-item').remove();
			}else if(v == "save"){
				// Show the publish button
				S('#btn-publish').css({'display':''});
				// Hide/show other elements
				S('#details').css({'display':'none'});
				S('#map').css({'display':''});
				S('#helper').css({'display':'none'});
				S('#map').trigger('resize');
				if(S('#add-item').length > 0) S('#add-item').css({'display':''});				
			}else if(v == "popupopen"){
				S('#btn-add-item').css({'display':'none'});
				S('#btn-delete-item').css({'display':'none'});
				S('#btn-edit-item').css({'display':''});
				S('#helper').css({'display':'none'});
			}else if(v == "popupclose"){
				S('#btn-add-item').css({'display':''});
				S('#btn-delete-item').css({'display':'none'});
				S('#btn-edit-item').css({'display':'none'});
			}
			return this;
		}

		this.startAdd = function(){
			this.action = "adding";
			this.setView('add');
			console.log(this);
			S('#app #location').append('<div id="add-item">'+osmedit.mapper.markers.waste.svg.replace(/%COLOR%/g,osmedit.mapper.markers.waste.background)+'<div class="balloon">Move the map to place the bin</div></div>').trigger('resize');
			
			return this;
		}

		this.editItem = function(){
			this.action = "edit";
			if((osmedit.user && osmedit.user.name) || !requirelogin){
				
				// TEMP
				if(!osmedit.changeset) osmedit.changeset = {'id':'TEST'};
				
				if(osmedit.changeset){
					
					console.log('activeNode',osmedit.mapper.activeNode)
					this.setView('edit');
					
					// Set form values
					var val = {};
					if(osmedit.mapper.activeNode && osmedit.mapper.activeNode.props) val = osmedit.mapper.activeNode.props;
					console.log(val);
					console.warn('Need to process form here');

					/*
					var tree = document.querySelector('#genus');
					tree.value = (val['species:en']||"");
					tree.setAttribute('data-vernacular',val['species:en']||"");
					tree.setAttribute('data-genus',val['genus=*']||"");
					tree.setAttribute('data-taxon',val['species']||"");
					document.querySelector('#height').value = (val['height']||0);
					document.querySelector('#circumference').value = (val['circumference']||0);
					*/

					osmedit.startChangeSet({});

				}else{
					console.error('Unable to create changeset');
				}

				return this;

			}else{

				return this.login();

			}
			return this;
		}


		// Add events
		S('#btn-view-map').on('click',{me:this},function(e){
			e.data.me.setView('map');
			location.href = "#map";
			e.data.me.init();
		});

		S('#btn-delete-item').on('click',{me:this},function(e){
			e.data.me.deleteItem();
		});

		S('#btn-edit-item').on('click',{me:this},function(e){
			e.data.me.editItem();
		});
		
		S('#details .close').on('click',function(e){
			S('#details').css({'display':'none'});
			S('#map').css({'display':''});
			S('#helper').css({'display':'none'});
			S('#map').trigger('resize');
			if(S('#add-item').length > 0) S('#add-item').css({'display':''});
		});

		this.addTags = function(json){
			
			if(!this.data) this.data = {};
			this.data.tags = json;

			function toggleOptions(cat){
				if(cat == "recycling"){
					S('#toggles-recycling').css({'display':''});
					S('#toggles-waste').css({'display':'none'});
				}else{
					S('#toggles-recycling').css({'display':'none'});
					S('#toggles-waste').css({'display':''});
				}
			}

			var html = {'waste':'','recycling':''};
			for(tag in this.data.tags){
				t = tag.replace(/:/g,"-").replace(/=/g,"-");
				category = (tag.indexOf('recycling')==0 ? 'recycling' : (tag.indexOf('waste')==0 ? 'waste' : ''));
				html[category] += '<li class="'+category+'"><label for="'+t+'-toggle">'+this.data.tags[tag].label+'</label><div class="switch"><input type="checkbox" id="'+t+'-toggle"><span><span aria-hidden="true">No</span><span aria-hidden="true">Yes</span><a></a></span></div></li>';
			}
			for(cat in html){
				S('#toggles-'+cat+' ul').html(html[cat]);
			}
			
			// Switch to waste
			toggleOptions('waste');

			// Add event to radio switch
			S('.switch.radio input').on('change',function(e){
				toggleOptions(e.currentTarget.getAttribute('id'));
			});

		}


		// Load some data
		S(document).ajax("taglist.json",{
			"dataType": "json",
			"this": this,
			"success": function(d){ this.addTags(d); },
			"error": function(e,attr){ console.error('Unable to load '+attr.file,e); }
		});



		return this;
	}
	
	function setScreen(hash){
		var li = S('header nav > ul > li');
		var j = -1;
		for(var i = 0; i < li.length; i++){
			if(S(li[i]).find('a').attr('href')==hash) j = i;
		}
		if(j >= 0){
			var el = S(li[j]).find('a');
			S('header nav a.theme-accent').removeClass('theme-accent');
			el.addClass('theme-accent');
		}
		if(hash.indexOf('#')==0){
			S('.screen').css({'display':'none'});
			S(hash).css({'display':'block'});
		}
		// Close menu
		S('#hamburger')[0].checked = false;
	}
	

	root.Application = Application;

})(window || this);