// mercurial.js - JavaScript utility functions
//
// Rendering of branch DAGs on the client side
// Display of elapsed time
// Show or hide diffstat
//
// Copyright 2008 Dirkjan Ochtman <dirkjan AT ochtman DOT nl>
// Copyright 2006 Alexander Schremmer <alex AT alexanderweb DOT de>
//
// derived from code written by Scott James Remnant <scott@ubuntu.com>
// Copyright 2005 Canonical Ltd.
//
// This software may be used and distributed according to the terms
// of the GNU General Public License, incorporated herein by reference.

var colors = [
	[ 1.0, 0.0, 0.0 ],
	[ 1.0, 1.0, 0.0 ],
	[ 0.0, 1.0, 0.0 ],
	[ 0.0, 1.0, 1.0 ],
	[ 0.0, 0.0, 1.0 ],
	[ 1.0, 0.0, 1.0 ]
];

function resizeIframe(obj) {
    window.addEventListener(
	'message', function(e) { document.getElementById('iframe').style.height = e.data + "px"; }, false);
    obj.contentWindow.postMessage("get_size", "http://192.168.200.83");
};

function Graph() {
	
	this.canvas = document.getElementById('graph');
	if (navigator.userAgent.indexOf('MSIE') >= 0) this.canvas = window.G_vmlCanvasManager.initElement(this.canvas);
	this.ctx = this.canvas.getContext('2d');
	this.ctx.strokeStyle = 'rgb(0, 0, 0)';
	this.ctx.fillStyle = 'rgb(0, 0, 0)';
	this.cur = [0, 0];
	this.line_width = 3;
	this.bg = [0, 4];
	this.cell = [2, 0];
	this.columns = 0;
	this.revlink = '';
	
	this.scale = function(height) {
		this.bg_height = height;
		this.box_size = Math.floor(this.bg_height / 1.2);
		this.cell_height = this.box_size;
	}
	
	function colorPart(num) {
		num *= 255
		num = num < 0 ? 0 : num;
		num = num > 255 ? 255 : num;
		var digits = Math.round(num).toString(16);
		if (num < 16) {
			return '0' + digits;
		} else {
			return digits;
		}
	}

	this.setColor = function(color, bg, fg) {
		
		// Set the colour.
		//
		// Picks a distinct colour based on an internal wheel; the bg
		// parameter provides the value that should be assigned to the 'zero'
		// colours and the fg parameter provides the multiplier that should be
		// applied to the foreground colours.
		
		color %= colors.length;
		var red = (colors[color][0] * fg) || bg;
		var green = (colors[color][1] * fg) || bg;
		var blue = (colors[color][2] * fg) || bg;
		red = Math.round(red * 255);
		green = Math.round(green * 255);
		blue = Math.round(blue * 255);
		var s = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
		this.ctx.strokeStyle = s;
		this.ctx.fillStyle = s;
		return s;
		
	}

	this.render = function(data) {
		
		var backgrounds = '';
		var nodedata = '';
		
		for (var i in data) {
			
			var parity = i % 2;
			this.cell[1] += this.bg_height;
			this.bg[1] += this.bg_height;
			
			var cur = data[i];
			var node = cur[1];
			var edges = cur[2];
			var fold = false;
			
			for (var j in edges) {
				
				line = edges[j];
				start = line[0];
				end = line[1];
				color = line[2];

				if (end > this.columns || start > this.columns) {
					this.columns += 1;
				}
				
				if (start == this.columns && start > end) {
					var fold = true;
				}
				
				x0 = this.cell[0] + this.box_size * start + this.box_size / 2;
				y0 = this.bg[1] - this.bg_height / 2;
				x1 = this.cell[0] + this.box_size * end + this.box_size / 2;
				y1 = this.bg[1] + this.bg_height / 2;
				
				this.edge(x0, y0, x1, y1, color);
				
			}
			
			// Draw the revision node in the right column
			
			column = node[0]
			color = node[1]
			
			radius = this.box_size / 8;
			x = this.cell[0] + this.box_size * column + this.box_size / 2;
			y = this.bg[1] - this.bg_height / 2;
			var add = this.vertex(x, y, color, parity, cur);
			backgrounds += add[0];
			nodedata += add[1];
			
			if (fold) this.columns -= 1;
			
		}
		
		document.getElementById('nodebgs').innerHTML += backgrounds;
		document.getElementById('graphnodes').innerHTML += nodedata;
		
	}

}


process_dates = (function(document, RegExp, Math, isNaN, Date, _false, _true){

	// derived from code from mercurial/templatefilter.py

	var scales = {
		'year':  365 * 24 * 60 * 60,
		'month':  30 * 24 * 60 * 60,
		'week':    7 * 24 * 60 * 60,
		'day':    24 * 60 * 60,
		'hour':   60 * 60,
		'minute': 60,
		'second': 1
	};

	function format(count, string){
		var ret = count + ' ' + string;
		if (count > 1){
			ret = ret + 's';
		}
 		return ret;
 	}

	function shortdate(date){
		var ret = date.getFullYear() + '-';
		// getMonth() gives a 0-11 result
		var month = date.getMonth() + 1;
		if (month <= 9){
			ret += '0' + month;
		} else {
			ret += month;
		}
		ret += '-';
		var day = date.getDate();
		if (day <= 9){
			ret += '0' + day;
		} else {
			ret += day;
		}
		return ret;
	}

 	function age(datestr){
 		var now = new Date();
 		var once = new Date(datestr);
		if (isNaN(once.getTime())){
			// parsing error
			return datestr;
		}

		var delta = Math.floor((now.getTime() - once.getTime()) / 1000);

		var future = _false;
		if (delta < 0){
			future = _true;
			delta = -delta;
			if (delta > (30 * scales.year)){
				return "in the distant future";
			}
		}

		if (delta > (2 * scales.year)){
			return shortdate(once);
		}

		for (unit in scales){
			var s = scales[unit];
			var n = Math.floor(delta / s);
			if ((n >= 2) || (s == 1)){
				if (future){
					return format(n, unit) + ' from now';
				} else {
					return format(n, unit) + ' ago';
				}
			}
		}
	}

	return function(){
		var nodes = document.getElementsByTagName('*');
		var ageclass = new RegExp('\\bage\\b');
		var dateclass = new RegExp('\\bdate\\b');
	        var nodedate = [];
	        var agenodes = [];
		for (var i=0; i<nodes.length; ++i){
			var node = nodes[i];
			var classes = node.className;
			if (ageclass.test(classes)){
			        var once = new Date(node.textContent);
			        var now = new Date();
			        nodedate.push(once / now);
			        agenodes.push(i);
				var agevalue = age(node.textContent);
				if (dateclass.test(classes)){
					// We want both: date + (age)
					node.textContent += ' ('+agevalue+')';
				} else {
					node.textContent = agevalue;
				}
			}
		}
	        var farthestdate = Math.min.apply(null, nodedate);
	        nodedate = nodedate.map(function(i){
		    return i - farthestdate;
		});
	        var maxtimedelta = Math.max.apply(null, nodedate);
	        for (var i=0; i<nodedate.length; ++i) {
		    opacity = nodedate[i] / maxtimedelta;
		    if (opacity < 0.1)
			opacity = 0.1;
		    nodes[agenodes[i]].parentNode.setAttribute(
			"style", "opacity: " + opacity + ";")
		};
	}
})(document, RegExp, Math, isNaN, Date, false, true)

function showDiffstat() {
	document.getElementById('diffstatdetails').style.display = 'inline';
	document.getElementById('diffstatexpand').style.display = 'none';
}

function hideDiffstat() {
	document.getElementById('diffstatdetails').style.display = 'none';
	document.getElementById('diffstatexpand').style.display = 'inline';
}
