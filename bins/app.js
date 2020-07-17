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



	function trigger(el,ev,opt){
		var event;
		if(!opt) opt = {};
		if(window.CustomEvent && typeof window.CustomEvent === 'function'){
			event = new CustomEvent(ev, {detail: opt});
		}else{
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(ev, true, true, opt);
		}
		el.dispatchEvent(event);
		return true;
	}
	function remove(el){
		if(el) el.parentNode.removeChild(el);
		return true;
	}

	function Application(opts){

		this.opts = opts;
		this.name = (opts.name||"ODI Leeds Editor");
		this.log = new Logger({'id':this.name,'logging':(location.search.indexOf("logging=true")>=0)});
		this.data = {};
		requirelogin = (typeof opts.requirelogin==="boolean" ? opts.requirelogin: true);

		// Access this within sub-functions
		var _obj = this;

		function setScreen(hash){
			_obj.log.message('setScreen',hash);
			var li = document.querySelectorAll('header nav > ul > li');
			var j = -1;
			for(var i = 0; i < li.length; i++){
				if(li[i].querySelectorAll('a')[0].getAttribute('href')==hash) j = i;
			}
			if(j >= 0){
				var el = li[j].querySelectorAll('a');
				document.querySelectorAll('header nav a.theme-accent').forEach(function(e){ e.classList.remove('theme-accent'); });
				el.forEach(function(e){ e.classList.add('theme-accent'); });
			}
			if(hash.indexOf('#')==0){
				document.querySelectorAll('.screen').forEach(function(e){ e.style.display = 'none'; });
				document.getElementById(hash.substr(1,)).style.display = 'block';
			}
			// Close menu
			document.getElementById('hamburger').checked = false;
		}

		// Add event to change of push state
		window[(pushstate) ? 'onpopstate' : 'onhashchange'] = function(e){
			console.log('onpopstate/onhashchange',location.hash);
			var hash = location.hash || "#intro";
			setScreen(hash);
		};
		
		this.message = function(msg,attr){
			if(msg) this.log.message(msg);

			var msgel = document.getElementById('messages');
			
			if(!attr) attr = {'id':'default'};
			if(!msg || msg == ""){
				if(msgel){
					msgel.classList.add('theme');
					// Remove the specific message container
					if(document.getElementById(attr.id)) remove(document.getElementById(attr.id));
					// Remove the whole message container if there is nothing left
					if(msgel.innerHTML == ""){
						msgel.parentNode.style['padding-bottom'] = '';
						remove(msgel);
					}
				}
			}else if(msg){
				// If there is no message container, we make that now
				if(!msgel){
					msgel = document.createElement('div');
					msgel.setAttribute('id','messages');
					document.body.appendChild(msgel);
				}
				msgel.classList.add('theme');
				el = document.getElementById(attr.id);
				if(!el){
					// We make a specific message container
					el = document.createElement('div');
					el.setAttribute('id',attr.id);
					if(!document.getElementById(attr.id)) msgel.appendChild(el);
				}
				el.innerHTML = msg;
			}

			return this;
		};

		this.init = function(){

			// Create an OSM Editor instance
			osmedit = ODI.OSMEditor();
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
			
			osmedit.mapper.map.on('zoomend', function() {
				//console.log('zoomend',_obj,osmedit.mapper.map.getZoom());
				if(osmedit.mapper.map.getZoom() < 17) document.getElementById('btn-add-item').setAttribute('disabled','disabled');
				else document.getElementById('btn-add-item').setAttribute('disabled','');
				_obj.message('',{'id':'editzoom'});
			});

			// Add login/logout events
			osmedit.on('login',{me:this},function(e){

				html = "";
				if(e.authenticated) document.getElementById('auth').classList.add('logged-in');			
				else document.getElementById('auth').classList.remove('logged-in');
				
				document.querySelectorAll('.user .name').innerHTML = (this.user.name||"?");
				document.querySelectorAll('.user .id').innerHTML = (this.user.id||"?");
				document.querySelector('.user .changesets').innerHTML  = (this.user.changesets||0);
				if(this.user.img) document.querySelector('.user img').setAttribute('src',this.user.img);
				document.getElementById('login').style.display = 'none';
			
			}).on('logout',{me:this},function(e){

				document.getElementById('auth').classList.remove('logged-in');
				document.querySelectorAll('.user .name').innerHTML = (this.user.name||"?");
				document.querySelectorAll('.user .id').innerHTML = (this.user.id||"?");
				document.querySelectorAll('.user .changesets').innerHTML = (this.user.changesets||0);
				document.querySelectorAll('.user img').setAttribute('src','resources/unknown.png');
				document.getElementsByTagName('body')[0].classList.remove('side-panel-open');
				
			});

			var _obj = this;

			// Bind functions to buttons
			document.getElementById('btn-add-item').addEventListener('click', function(e){ _obj.addItem(); });
			document.getElementById('btn-save-item').addEventListener('click', function(e){ _obj.saveItem(); });
			document.getElementById('btn-save-details').addEventListener('click', function(e){ _obj.saveItem(); });
			document.getElementById('btn-publish').addEventListener('click', function(e){
				console.log('test publish');
				// Hide the publish button
				document.getElementById('btn-publish').style.display = 'none';
				_obj.publish();
			});
			document.getElementById('logout').addEventListener('click', function(e){ osmedit.logout(); });
			document.getElementById('user').addEventListener('click',function(e){
				document.getElementById('user').parentNode.classList.toggle('open');
				document.body.classList.toggle('side-panel-open');
			});

			// Do a check to see if we are already logged in
			// This is asynchronous so we might
			// not know the result until later.
			osmedit.getUserDetails();


			// Set up the UI:
			// Hide sections
			var sections = document.querySelectorAll('#main section');
			for(var i = 1; i < sections.length; i++) sections[i].style.display = 'none';


			// Add an event to the bg
			document.querySelector('.bg').addEventListener('click',function(e){
				document.getElementById('hamburger').checked = false;
			});

			function getCenter(){ return osmedit.mapper.map.getCenter(); }
			function getCenterTile(url,zoom){
				ll = getCenter();
				var x = (Math.floor((ll.lng + 180) / 360 * Math.pow(2, zoom)));
				var y = (Math.floor((1 - Math.log(Math.tan(ll.lat * Math.PI / 180) + 1 / Math.cos(ll.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
				var xy = {
					x: x,
					y: y
				};
				return url.replace("{z}",18).replace("{x}",xy.x).replace("{y}",xy.y).replace("{r}","").replace("{s}","a");
			}

			// Build map base tile selector
			var opts = "";
			var o = osmedit.mapper.getLayers();
			var selected = 0;
			for(var i = 0; i < o.length; i++){
				if(osmedit.mapper.selectedLayer == o[i].id) selected = i;
				opts += '<option value="'+o[i].id+'"'+(selected == i ? ' selected="selected"':'')+'>'+o[i].id+'</option>';
			}
			document.getElementById('layerSelect').innerHTML = opts;
			document.getElementById('layerSelected').setAttribute('src',getCenterTile(o[selected].url,18));
			document.getElementById('layerSelect').addEventListener('change',function(e){
				osmedit.mapper.changeLayer(e.currentTarget.value);
				var l = osmedit.mapper.getLayer();
				var url = getCenterTile(l.url,18);
				document.getElementById('layerSelected').setAttribute('src',url);
			});


			// Add events
			osmedit.mapper.on('geostart',function(e){
				_obj.message('Finding location...');
			});
			osmedit.mapper.on('geoend',function(e){
				_obj.message('');
			});
			osmedit.mapper.on('updatenodes',{'blah':'test'},function(e){
				//console.log('updatenodes',e);
				document.getElementById('loader').style.display = 'none';
			});
			osmedit.mapper.on('popupopen',function(e){
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
			});
			// Moving the map we remove the helper balloon
			osmedit.mapper.on('movestart',function(e){
				var el = document.querySelectorAll('#add-item .balloon')[0];
				remove(el);
			});
			// When the popup is closed we stop editing mode
			osmedit.mapper.on('popupclose',function(e){
				if(_obj.action=="adding"){
				}else _obj.setView('popupclose');
				osmedit.mapper.activeNode = {};
			});
			
			// Set the node type
			osmedit.setNode({
				'type':['amenity=waste_basket','amenity=recycling']
			});

			document.querySelectorAll('#loader .label')[0].innerHTML = 'Loading bins...';

			var propertylookup = {
				'OSMID':{'hide':true}
			}

			osmedit.getNodes({
				'overpass':true,
				'popup': function(){
					var str,cls,title,types,p,i,ts,ul;
					ul = '';
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
							str += (str ? ', ':'')+(ts > 1 && i == ts-1 ? 'and ':'')+((_obj.data.tags ? _obj.data.tags[p].label:p)||p);
							if(this.props[p] == "yes"){
								str += ": &#10003;";
							}else if(this.props[p] == "no"){
								str += ": &#10060;";
							}else{
								str += ": "+this.props[p];
							}
							i++;
						}
					}
					for(p in this.props){
						if(!propertylookup[p] || (propertylookup[p] && !propertylookup[p].hide)){
							ul += '<tr><td><strong>'+(propertylookup[p] ? propertylookup[p].label : p)+'</strong>:</td><td>'+this.props[p]+'</td></tr>';
						}
					}
					ul += '<tr><td><strong>OSMID:</strong></td><td>'+this.id+'</td></tr>'
					ul = '<table class="small">'+ul+'</table>';
					return {'label':'<h3>'+title+'</h3>'+(str ? '<p>'+str+'</p>':'')+ul, 'options':{'className':cls,'icon':ico}};
				}
			});
			
			this.changes = [];

			var el = document.getElementById('init');
			remove(el);

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
			
			var login = document.getElementById('login')
			// Show pre-login screen
			login.style.display = '';
			login.querySelectorAll('.close')[0].addEventListener('click',function(e){
				login.style.display = 'none';
			});
	
			// Login
			document.getElementById('btn-login').addEventListener('click',function(e){
				console.log('clicked');
				osmedit.login();
			});
			
			return this;
		}


		// Add an item (may require login
		this.addItem = function(){
			if((osmedit.user && osmedit.user.name) || !requirelogin){
				// Must be at least zoom 17 to be able to add a bin
				if(osmedit.mapper.map.getZoom() >= 17){
					this.startAdd();
				}else{
					this.message('You need to zoom in more to place a new bin',{'id':'editzoom'});
					console.warn('You need to zoom in more to place a new bin.');
				}
				return this;
			}else{
				return this.login();
			}
		}

		this.setButton = function(name,state){
			state = (state=="off" ? 'none':'');
			id = "";
			if(name=="publish") id = 'btn-publish-item';
			else if(name=="save") id = 'btn-save-item';
			else if(name=="edit") id = 'btn-edit-item';
			else if(name=="delete") id = 'btn-delete-item';
			
			if(id) document.getElementById(id).style.display = state;
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
			if(document.getElementById('add-item')){
				var el = document.getElementById('add-item');
				remove(el);
			}
			
			// Add bin properly

			// Get properties
			var el = document.getElementById('genus');
			var genus = el.getAttribute('data-genus');
			var vernac = el.getAttribute('data-vernacular');
			var taxon = el.getAttribute('data-taxon');
			var height = parseFloat(document.getElementById('height').value);
			var circ = parseFloat(document.getElementById('circumference').value);


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

			this.log.message('setting view to '+v);
			
			var el = {
				'splash':document.getElementById('splash'),
				'app':document.getElementById('app'),
				'map':document.getElementById('map'),
				'addItem':document.getElementById('add-item'),
				'screen':document.querySelector('.screen'),
				'details':document.getElementById('details'),
				'helper':document.getElementById('helper'),
				'btn':{
					'add':document.getElementById('btn-add-item'),
					'del':document.getElementById('btn-delete-item'),
					'edit':document.getElementById('btn-edit-item'),
					'save':document.getElementById('btn-save-item'),
					'publish':document.getElementById('btn-publish')
				}
			};
			console.log('el',el);

			el.splash.style.display = 'none';



			if(v == "map"){
				el.app.style.display = 'block';
				trigger(el.app,'resize');
				el.map.style.display = 'block';
				trigger(el.map,'resize');
			}else if(v == "edit"){
				if(el.addItem) el.addItem.style.display = 'none';
				el.screen.style.display = 'none';
				el.details.style.display = '';
				el.helper.style.display = 'none';
			}else if(v == "add"){
				el.btn.add.style.display = 'none';
				el.btn.del.style.display = '';
				el.btn.edit.style.display = '';
				el.btn.save.style.display = '';
				remove(el.addItem);
			}else if(v == "done"){
				el.btn.add.style.display = '';
				el.btn.del.style.display = 'none';
				el.btn.edit.style.display = 'none';
				el.btn.save.style.display = 'none';
				remove(el.addItem);
			}else if(v == "save"){
				// Show the publish button
				el.btn.publish.style.display = '';
				// Hide/show other elements
				el.details.style.display = 'none';
				el.map.style.display = '';
				el.helper.style.display = 'none';
				trigger(el.map,'resize');
				if(el.addItem) el.addItem.style.display = '';			
			}else if(v == "popupopen"){
				el.btn.add.style.display = 'none';
				el.btn.del.style.display = 'none';
				el.btn.edit.style.display = '';
				el.helper.style.display = 'none';
			}else if(v == "popupclose"){
				el.btn.add.style.display = '';
				el.btn.del.style.display = 'none';
				el.btn.edit.style.display = 'none';
			}
			return this;
		}

		this.startAdd = function(){
			this.action = "adding";
			this.setView('add');
			var el = document.querySelector('#app #location');
			el.innerHTML += '<div id="add-item">'+osmedit.mapper.markers.waste.svg.replace(/%COLOR%/g,osmedit.mapper.markers.waste.background)+'<div class="balloon">Move the map to place the bin</div></div>';
			trigger(el,'resize');
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
		
		document.getElementById('btn-view-map').addEventListener('click',function(e){
			_obj.setView('map');
			location.href = "#map";
			_obj.init();
		});

		document.getElementById('btn-delete-item').addEventListener('click',function(e){
			_obj.deleteItem();
		});

		document.getElementById('btn-edit-item').addEventListener('click',function(e){
			_obj.editItem();
		});
		
		document.querySelector('#details .close').addEventListener('click',function(e){
			document.getElementById('details').style.display = 'none';
			document.getElementById('map').style.display = '';
			document.getElementById('helper').style.display = 'none';
			trigger(document.getElementById('map'),'resize');
			if(document.getElementById('add-item')) document.getElementById('add-item').style.display = '';
		});

		this.addTags = function(json){
			
			if(!this.data) this.data = {};
			this.data.tags = json;

			function toggleOptions(cat){
				var rec = document.getElementById('toggles-recycling');
				var wst = document.getElementById('toggles-waste');
				if(cat == "recycling"){
					rec.style.display = '';
					wst.style.display = 'none';
				}else{
					rec.style.display = 'none';
					wst.style.display = '';
				}
			}

			var html = {'waste':'','recycling':''};
			for(tag in this.data.tags){
				t = tag.replace(/:/g,"-").replace(/=/g,"-");
				category = (tag.indexOf('recycling')==0 ? 'recycling' : (tag.indexOf('waste')==0 ? 'waste' : ''));
				html[category] += '<li class="'+category+'"><label for="'+t+'-toggle">'+this.data.tags[tag].label+'</label><div class="switch"><input type="checkbox" id="'+t+'-toggle"><span><span aria-hidden="true">No</span><span aria-hidden="true">Yes</span><a></a></span></div></li>';
			}
			for(cat in html){
				document.querySelector('#toggles-'+cat+' ul').innerHTML = html[cat];
			}
			
			// Switch to waste
			toggleOptions('waste');

			// Add event to radio switch
			document.querySelectorAll('.switch.radio input').forEach(function(el){
				el.addEventListener('change',function(ev){
					toggleOptions(ev.target.getAttribute('id'));
				});
			});

		}
		
		// Load some data
		fetch('taglist.json')
		.then(response => response.json())
		.then(json => {
			_obj.addTags(json);
		}).catch(function(error) {
			console.error('Unable to load taglist.json',error);
		});

		return this;
	}
	

	root.Application = Application;

})(window || this);