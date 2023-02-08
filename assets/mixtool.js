/*   

Mixtool © 2012 by Jamie Perkins
http://inorganik.net

FUNCTION INDEX

buildKeySelect()
setKeyPref(pref)
readKeyPref()
findMatches(key)
textKeyMatches(key)
findAllMatches(type)
detectHarmonic(type)
reOrderTracks()
reverseTracks()
randomize()
makeToken()
newMix()
save(boo)
copy()
printMix()
deleteMix(mixToken)
makeButton(mixToken)
loadMix(mixToken)
loadAll()
addTrack()
removeTrack()
searchTrack()
selectKey()
help()

*/

var trackli;

var keyMode = 1;

var traditionalKeys = ["E major", "B major", "F-sharp major", "D-flat major", "A-flat major", "E-flat major", "B-flat major", "F major", "C major", "G major", "D major", "A major", "d-flat minor", "a-flat minor", "e-flat minor", "b-flat minor", "f minor", "c minor", "g minor", "d minor", "a minor", "e minor", "b minor", "f-sharp minor"];

var camelotKeys = ["12B", "1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B", "10B", "11B", "12A", "1A", "2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A", "10A", "11A"];


function buildKeySelect() {
	
	var keyNames = ((keyMode == 1) ? traditionalKeys.concat() : camelotKeys.concat());
	
	$(keyNames).each(function(i) {
		
		$('select[name=key]').append('<option value="'+i+'">'+keyNames[i]+'</option>');
		
	});
	
}

function setKeyPref(pref) {
	
	var name = "keyPref";
	
	var date = new Date();
	date.setTime(date.getTime()+(3650 * 1000 * 60 * 60 * 24));
	var expires = "; expires="+date.toGMTString();
	
	document.cookie = name + "=" +pref+";expires=" +expires+"; path=/";
	
	$('button').removeClass('keyPref');
	(pref == 1) ? $('button.tradKeys').addClass('keyPref') : $('button.camKeys').addClass('keyPref');
	
	keyMode = pref;
	var mixName = $('input[name=mixTitle]').val();
	if (mixName) save(false);
	window.location.reload();
}

function readKeyPref() {
	
	var pref = keyMode;
	var name = "keyPref";
	var ca = document.cookie.split(';');
	
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(name) == 0) {
	
			var eqIndex = c.indexOf("=");
			pref = c.substring((eqIndex+1),c.length);
			
			keyMode = pref;
		
		}
	}
	(pref == 1) ? $('button.tradKeys').addClass('keyPref') : $('button.camKeys').addClass('keyPref');
	buildKeySelect();
}

function findMatches(key) {
	
	key = Number(key);
	
	var lower = key;
	var higher = key;
	
	if (key > 11) {
		(key == 12) ? lower = 23 : lower--;
		(key == 23) ? higher = 12 : higher++;
		var majorminor = key-12;
	} else {
		(key == 0) ? lower = 11 : lower--;
		(key == 11) ? higher = 0 : higher++;
		var majorminor = key+12;
	} 
	var matchedKeys = [];
	
	matchedKeys[0] = key;
	matchedKeys[1] = lower;
	matchedKeys[2] = higher;
	matchedKeys[3] = majorminor;
	
	return matchedKeys;
}

function textKeyMatches(key) {
	
	var matches = findMatches(key);
	
	var matchedKeys = [];
	
	$(matches).each(function(i) {
		
		matchedKeys[i] = ((keyMode == true) ? traditionalKeys[matches[i]] : camelotKeys[matches[i]]);
	});
	
	matchedKeys = matchedKeys.join(", ");
	
	return matchedKeys;
}

function findAllMatches(page) {
	var trackKeys = [];
	var matchable = [];
	
	$('ol li').each(function(i) {
		
		var key = ((page == 'print') ? $(this).children('input[name=key]').val() : $(this).find('select').val());
		if (key) {
			trackKeys[i] = key;
			matchable[i] = findMatches(key);
		}
	});

	var matchedSets = [];
	
	$(trackKeys).each(function(j) {
		
		var trackMatches = [];
		
		$(matchable).each(function(k) {
			if (k != j) {
				$(matchable[k]).each(function(l) {
					if (this == trackKeys[j]) {
						trackMatches.push(Number(k));
					}
				});
			}
		});
		
		matchedSets[j] = trackMatches;
	});
	var orderedSets = [];
	
	$(matchedSets).each(function(m) {
		
		matchedSets[m].sort(function(a,b) {
			return matchedSets[b].length - matchedSets[a].length;
		});
		
	});
	
	// alert("matched: "+matchedSets.join(" - "));
	return matchedSets;
}

function detectHarmonic(page) {
	
	var matchedSets = ((page == 'print') ? findAllMatches('print') : findAllMatches(0));
	var numMixes = [];
	
	$('ol li').children('.harmonic').css({display: 'none'});
	
	$('ol li').each(function(i) {
		
		var prec = i-1;
		if (i > 0) {
			$(matchedSets[prec]).each(function(p) {
				
				if (this == i) {
					
					$('ol li').eq(prec).children('.harmonic').css({display: 'block'});
					numMixes.push(1);
				} 
			});
			// match type
			
			var key = ((page == 'print') ? $('ol li').eq(prec).children('input[name=key]').val() : $('ol li').eq(prec).find('select').val());
			var currentKey = ((page == 'print') ? $(this).children('input[name=key]').val() : $(this).find('select').val());
			var matches = findMatches(key);
			var type;
			
			if (key) {
				$(matches).each(function(m) {
					
					if (this == currentKey) {
						if (m == 0) type = "same key";
						if (m == 1) type = "key down";
						if (m == 2) type = "key up";
						if (m == 3) {
							(key > 11) ? type = "minor-major" : "major-minor";
						}
					}
				});
				if (page == 'print') type = "<img src=\"../_images/mixPrint.gif\"><span>"+type+"</span>";
				$('ol li').eq(prec).children('.harmonic').html(type);
			}
		}
	});
	
	$('.numHarmonic').html(numMixes.length+((numMixes.length == 1) ? " harmonic mix" : " harmonic mixes"));
	return numMixes.length;
}

function reOrderTracks() {
	
	var trackTitles = [];
	var trackKeys = [];
	var trackNumbers = [];
	
	$('ol.tracklist li').each(function(g) {
		trackTitles.push($('ol.tracklist li').eq(g).find('input[name=track]').val());
		var key = $('ol.tracklist li').eq(g).find('select').val();
		if (!key) {
			alert("Please select a key for each track.");
			return false;
		} else {
			trackKeys.push(key);
		}
		trackNumbers.push(g);
	});
	
	var matchedSets = findAllMatches(true);
	var harvestList = matchedSets.concat();
	var newOrder = [];
	
	var toMatch = 999;	
	var singleMatch = 999;
	
	// first, tracks with no match
	$(harvestList).each(function(ii) {
		var ts = 999;
		
		$(harvestList).each(function(i) {
			
			if (harvestList[i].length < 1) {
				
				ts = i;
				newOrder.push(trackNumbers[i]);
				return false;
			}
		});
		
		if (ts < 999) {
			harvestList.splice(ts, 1);
			trackNumbers.splice(ts, 1);
		}
	});
	
	// second, tracks with one match whose match is one match
	$(harvestList).each(function(jj) {
		var ts = 999;
		
		$(harvestList).each(function(j) {
			
			// if we are matching a singleMatch
			if (singleMatch < 999) {
				$(harvestList[j]).each(function(k) {
					
					if (this == singleMatch) {
						ts = j;
						newOrder.push(trackNumbers[j]);
						singleMatch = 999;
						return false;
					}
				});
				if (ts < 999) return false;
			}
			else if (harvestList[j].length == 1 && matchedSets[harvestList[j]].length == 1) {
				
				ts = j;
				newOrder.push(trackNumbers[j]);
				singleMatch = trackNumbers[j];
				return false;
				
			} 
		});
		
		if (ts < 999) {
			
			harvestList.splice(ts, 1);
			trackNumbers.splice(ts, 1);
		}
	});
	
	// third, tracks with matches
	$(harvestList).each(function(ll) {
		// alert("multiple match loop: "+ll+ ". toMatch = "+toMatch+". remaining tracks: "+trackNumbers);
		var ts = 999;
			
		$(harvestList).each(function(l) {
			
			// multiple matches
			if (toMatch < 999) {
				
				$(harvestList[l]).each(function(m) {
					
					if (this == toMatch) {
						
						ts = l;
						newOrder.push(trackNumbers[l]);
						toMatch = trackNumbers[l];
						return false;
					}
				});
				if (ts < 999) return false;
			}
			// keystone match: a track with one match whose match matches multiple tracks
			else if (harvestList[l].length == 1 && matchedSets[harvestList[l]].length > 1) { 
				
				ts = l;
				newOrder.push(trackNumbers[l]);
				toMatch = trackNumbers[l];
				return false;
			}
			
		}); // end inner loop
		
		if (ts < 999) {
			
			harvestList.splice(ts, 1);
			trackNumbers.splice(ts, 1);
			// alert("spliced: "+trackNumbers[ts]+". Remaining: "+trackNumbers);
		
		} else { // new match group
			
			var least = 999;
			
			$(harvestList).each(function(n) {
				if (this.length < least) {
					least = this.length;
					ts = n;
				}
			});
			newOrder.push(trackNumbers[ts]);
			toMatch = trackNumbers[ts];
			harvestList.splice(ts, 1);
			trackNumbers.splice(ts, 1);
		}
			
	});
	
	// alert("Remaining tracks: "+((trackNumbers.length < 1) ? "0" : trackNumbers)+", newOrder: "+newOrder);
	
	if (trackNumbers.length > 0) {
		alert("did not build all tracks. ("+trackNumbers+")");	
	}
	
	$('ol.tracklist').html("<li class=\"firstItem\">"+trackli+"</li>");
	
	$(newOrder).each(function(m) {
				
		if (m > 0) { $('ol.tracklist').append('<li>'+trackli+'</li>') }		
		
		$('ol.tracklist li').eq(m).find('input[name=track]').val(trackTitles[newOrder[m]]);
		$('ol.tracklist li').eq(m).find('select').val(trackKeys[newOrder[m]]);
		$('ol.tracklist li').eq(m).find('input[name=mixable]').val(textKeyMatches(trackKeys[newOrder[m]]));
		
	});
	
	detectHarmonic(0);
	
}

function reverseTracks() {
	
	var trackTitles = [];
	var trackKeys = [];
	var trackNumbers = [];
	
	$('ol.tracklist li').each(function(g) {
		trackTitles.push($('ol.tracklist li').eq(g).find('input[name=track]').val());
		trackKeys.push($('ol.tracklist li').eq(g).find('select').val());
		trackNumbers.push(g);
	});
	
	trackNumbers.reverse();
	
	$('ol.tracklist').html("<li class=\"firstItem\">"+trackli+"</li>");
	
	$(trackNumbers).each(function(m) {
				
		if (m > 0) { $('ol.tracklist').append('<li>'+trackli+'</li>') }		
		
		$('ol.tracklist li').eq(m).find('input[name=track]').val(trackTitles[trackNumbers[m]]);
		$('ol.tracklist li').eq(m).find('select').val(trackKeys[trackNumbers[m]]);
		$('ol.tracklist li').eq(m).find('input[name=mixable]').val(textKeyMatches(trackKeys[trackNumbers[m]]));
		
	});
	
	detectHarmonic(0);
	
}

function randomize() {
	
	var trackTitles = [];
	var trackKeys = [];
	var trackNumbers = [];
	
	$('ol.tracklist li').each(function(g) {
		trackTitles.push($('ol.tracklist li').eq(g).find('input[name=track]').val());
		trackKeys.push($('ol.tracklist li').eq(g).find('select').val());
		trackNumbers.push(g);
	});
	
	trackNumbers.sort(function() {return 0.5 - Math.random()});
	
	$('ol.tracklist').html("<li class=\"firstItem\">"+trackli+"</li>");
	
	$(trackNumbers).each(function(m) {
				
		if (m > 0) { $('ol.tracklist').append('<li>'+trackli+'</li>') }		
		
		$('ol.tracklist li').eq(m).find('input[name=track]').val(trackTitles[trackNumbers[m]]);
		$('ol.tracklist li').eq(m).find('select').val(trackKeys[trackNumbers[m]]);
		$('ol.tracklist li').eq(m).find('input[name=mixable]').val(textKeyMatches(trackKeys[trackNumbers[m]]));
		
	});
	
	detectHarmonic(0);
	
}

function makeToken() {
    var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var string = '';
    for (i = 0; i < 16; i++) {
        string += characters[Math.round(Math.random()*51)];
    }
    return string;
}

var activeMix = makeToken();

function newMix() {
	$('input[name=mixTitle]').val("");
	$('ol.tracklist').html("<li class=\"firstItem\">"+trackli+"</li>");
	$('button.mix').removeClass('active');
	$('.numHarmonic').html("");
	activeMix = makeToken();
}

function save(boo) {
	console.log('save');
	var mixName = escape($('input[name=mixTitle]').val());
	
	if (mixName) {
		var name = "mixtool."+activeMix;
	} else {
		alert("Please enter a title for the mix.");
		return false;
	}
	
	var name = "mixtool."+activeMix;
	var ca = document.cookie.split(';');
	
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(name) == 0) {
	
			var date = new Date();
			date.setTime(date.getTime()+(-1 * 1000 * 60 * 60 * 24));
			var expires = "; expires="+date.toGMTString();
			
			document.cookie = name + "=" + "" + ";expires=" +expires+"; path=/";
		
		}
	}
	
	var tracks = [mixName];
	
	$('ol.tracklist li').each(function(i) {
		var trackTitle = $(this).find('input[name=track]').val();
		var trackNum = i+1;
		if (!trackTitle) { trackTitle = "track "+trackNum }
		var track = trackTitle + "\\" + $(this).find('select').val();
		tracks.push(track);
	});
	
	var date = new Date();
	date.setTime(date.getTime()+(3650 * 1000 * 60 * 60 * 24));
	var expires = "; expires="+date.toGMTString();
	
	document.cookie = name + "=" +tracks+";expires=" +expires+"; path=/";
	
	$('button.delete').remove(); 
	var delbtn = "<button class=\"file delete\" onClick=\"deleteMix()\">delete</button>";
	$(delbtn).insertAfter('button[name=hiddenSave]');
	
	if (boo) alert("Saved\n\""+unescape(mixName)+"\"");
	
	loadAll();
}

function copy() {
	activeMix = makeToken();
	var title = $('input[name=mixTitle]').val();
	title = title + " copy";
	$('input[name=mixTitle]').val(title)
	save(false);
}

function printMix() {
	
	var name = $('input[name=mixTitle]').val();
	
	var query = "print/?p="+activeMix;
	
	var printWin = window.open(query, name);
	printWin.focus();
	
}

function deleteMix() {
	console.log('delete');
	var mixName = $('input[name=mixTitle]').val();
	
	if (confirm("Are you sure you want to delete \""+mixName+"\"?")) {
		
		var name = "mixtool."+activeMix;
		var ca = document.cookie.split(';');
		
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(name) == 0) {
		
				var date = new Date();
				date.setTime(date.getTime()+(-1 * 1000 * 60 * 60 * 24));
				var expires = "; expires="+date.toGMTString();
				
				document.cookie = name + "=" + "" + ";expires=" +expires+"; path=/";
				
				$('#'+activeMix).remove();
			}
		}
		
		$('input[name=mixTitle]').val("");
		$('ol.tracklist').html("<li class=\"firstItem\">"+trackli+"</li>");
		
	} 
	
}

function makeButton(mixToken) {
	
	var name = "mixtool."+mixToken;
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(name) == 0) {
			
			var eqIndex = c.indexOf("=");
			var token = c.substring(8,24);
			
			var contents = c.substring((eqIndex+1),c.length);
			contents = contents.split(',');
			var mixName = contents[0];
			
			var buttonHtml = "<button class=\"mix\" id=\""+mixToken+"\"";
			buttonHtml += "onClick=\"loadMix('"+mixToken+"')\">";
			var title = unescape(mixName);
			buttonHtml += title+"</button>";
			return buttonHtml;
		}
	}
}

function loadMix(mixToken) {
		
	var name = "mixtool."+mixToken;
	$('button.mix').removeClass('active');
	$('#'+mixToken).addClass('active');
		
	var ca = document.cookie.split(';');
	$('ol.tracklist').html("<li class=\"firstItem\">"+trackli+"</li>");
	
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(name) == 0) {
			
			var eqIndex = c.indexOf("=");
			var token = c.substring(8,24);
			
			$('button.delete').remove(); 
			var delbtn = "<button class=\"file delete\" onClick=\"deleteMix()\">delete</button>";
			$(delbtn).insertAfter('button[name=hiddenSave]');
			
			var contents = c.substring((eqIndex+1),c.length);
			contents = contents.split(',');
			$('input[name=mixTitle]').val(unescape(contents[0]));
			
			$(contents).each(function(j) {
				
				if (j > 0) { 
					
					if (j > 1) { $('ol.tracklist').append('<li>'+trackli+'</li>') };
					
					var trackInfo = contents[j].split('\\');
					
					$('ol.tracklist li').eq(j-1).find('input[name=track]').val(trackInfo[0]);
					$('ol.tracklist li').eq(j-1).find('select').val(trackInfo[1]);
					$('ol.tracklist li').eq(j-1).find('input[name=mixable]').val(textKeyMatches(trackInfo[1]));
				}
				
			});
			detectHarmonic(0);
			activeMix = mixToken;
		}
	}
}

function loadAll() {
	
	var name = "mixtool.";
	var ca = document.cookie.split(';');
	var mixesHtml = "";
	var mixes = [];
	
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(name) == 0) {
			mixes.push(c.substring(8,24));
		}
	}
	
	if (mixes.length > 0) {
		mixes.reverse();
		$(mixes).each(function(j) {
			mixesHtml += makeButton(mixes[j]);
		});
		$('#mixes').html(mixesHtml);
		$('#mixes').css({display: 'block'});
		loadMix(mixes[0]);
	} else {
		activeMix = makeToken();
	}
}

function addTrack() {
	$('<li>'+trackli+'</li>').insertAfter($(this).parent());
	detectHarmonic(0);
}
function removeTrack() {
	$(this).parent().remove();
	if ($('ol.tracklist li').length > 1) {
		$('ol.tracklist li:not(:has("a.removeTrack"))').append('<a class="trackCount removeTrack">&ndash;</a>');
	} else {
		$('ol.tracklist li:first a.removeTrack').remove();
	}
	detectHarmonic(0);
}
function searchTrack() {
	var url = "http://beatport.com/search?q=";
	var term = $(this).parent().find('input[name=track]').val();
	term = term.replace(/-/g, "");
	term = term.replace(/ /g, "+");
	term = term.replace("++", "+");
	url += term;
	var searchWin = window.open(url, 'beatport');
	searchWin.focus();
}
function selectKey() {
	var result = textKeyMatches($(this).val());
	$(this).next().val(result);
	detectHarmonic(0); 
}
function activeMix() {
	$('button.mix').removeClass('active');
	$(this).addClass('active');
}
function help() {
	$('#help').slideToggle('fast');
}