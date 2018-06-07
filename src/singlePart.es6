var Vex = require('vexflow')
   ,$ = require('jquery')
   ,_ = require('underscore')
   ,NoSleep = require('nosleep.js');

var noSleep = new NoSleep();

/**********************************************/
(function() {

  if (!(Vex && Vex.Flow)) {
    throw "Please be sure vexflow is required before requiring vexflow.json."
  }

  Vex.Flow.JSON = function(data, offset) {
    this.data = data;
    this.stave_offset = offset;
    this.stave_delta = 60;
    this.staves = {};
    this.interpret_data();
  }

  Vex.Flow.JSON.prototype.interpret_data = function() {
    if (this.data instanceof Array) {
      if (this.data[0] instanceof Array) {
        this.notes = this.interpret_notes(this.data);
      } else if (typeof this.data[0] === "string") {
        this.notes = this.interpret_notes([ { keys: this.data } ]);
      }
    } else if (this.data.keys) {
      this.notes = this.interpret_notes([this.data]);
    } else if (this.data.notes) {
      this.notes = this.interpret_notes(this.data.notes);
    } else if (this.data.voices) {
      this.voices = this.interpret_voices(this.data.voices);
    }
  };

  Vex.Flow.JSON.prototype.interpret_notes = function(data) {
    return _(data).map(function(datum) {
      if (typeof datum === "string") {
        if (datum == "|") { return { barnote: true} }
        else {
          return { duration: "q", keys: this.interpret_keys([datum]) };
        }
      } else if (datum instanceof Array) {
        return { duration: "q", keys: this.interpret_keys(datum) };
      } else {
        if (datum.keys) {
          datum.keys = this.interpret_keys(datum.keys);
          datum.duration || (datum.duration = "q");
        }
        return datum;
      }
    }, this);
  };
  
  Vex.Flow.JSON.prototype.interpret_voices = function(data) {
    return _(data).map(function(datum) {
      return {
        time: datum.time,
        notes: this.interpret_notes(datum.notes)
      }
    }, this);
  };

  Vex.Flow.JSON.prototype.interpret_keys = function(data) {
    return _(data).map(function(datum) {
      var note_portion, octave_portion, _ref;
      _ref = datum.split("/"), note_portion = _ref[0], octave_portion = _ref[1];
      octave_portion || (octave_portion = "4");
      return "" + note_portion + "/" + octave_portion;
    });
  };

  Vex.Flow.JSON.prototype.draw_canvas = function(canvas, canvas_options) {
    canvas_options = canvas_options || {};
    
    this.canvas = canvas;
    var backend = Vex.Flow.Renderer.Backends.CANVAS;
    if (canvas.tagName.toLowerCase() === "svg") {
      backend = Vex.Flow.Renderer.Backends.SVG;
    }
    this.renderer = new Vex.Flow.Renderer(this.canvas, backend);
    this.context = this.renderer.getContext();
    
    if (canvas_options.scale) {
      this.context.scale(canvas_options.scale, canvas_options.scale);
    }
  };

  Vex.Flow.JSON.prototype.draw_stave = function(clef, keySignature, options) {
    if (clef == null) clef = "treble";
    if (!(clef instanceof Array)) clef = [clef];
    if (options == null) options = {};

    _(clef).each(function(c) {
      this.staves[c] = new Vex.Flow.Stave(10, (this.stave_offset), (this.width)/4, {glyph_spacing_px:1});
      this.staves[c].addClef(c).addKeySignature(keySignature).setContext(this.context).draw();
      this.stave_offset += this.stave_delta;
    }, this);
  };

  Vex.Flow.JSON.prototype.stave_notes = function(notes) {
    return _(notes).map(function(note) {
      if (note.barnote) { return new Vex.Flow.BarNote(); }
      
      var stave_note;
      note.duration || (note.duration = "h");
      note.clef = "treble"; // Forcing to treble for now, even though bass may be present (we just line it up properly)
      stave_note = new Vex.Flow.StaveNote(note);

      _(note.keys).each(function(key, i) {
        var accidental, note_portion;
        note_portion = key.split("/")[0];
        accidental = note_portion.slice(1, (note_portion.length + 1) || 9e9);

        if (accidental.length > 0) {
          stave_note.addAccidental(i, new Vex.Flow.Accidental(accidental));
        }
      });
      return stave_note;
    });
  };
  
  Vex.Flow.JSON.prototype.draw_notes = function(notes) {
    var beams = Vex.Flow.Beam.generateBeams(notes, {groups : [ new Vex.Flow.Fraction(1,2)]});
    Vex.Flow.Formatter.FormatAndDraw(this.context, this.staves["treble"], notes);
    var beamContext = this.context;
    _(beams).each( function (beam, i){
      beam.setContext(beamContext).draw();
    })
  };
  
  Vex.Flow.JSON.prototype.stave_voices = function(voices) {
    return _(this.voices).map(function(voice) {
      var stave_voice = new Vex.Flow.Voice({
        num_beats: voice.time.split("/")[0],
        beat_value: voice.time.split("/")[1],
        resolution: Vex.Flow.RESOLUTION
      });
      
      stave_voice.setStrict(true);
      stave_voice.addTickables(this.stave_notes(voice.notes));
      return stave_voice;
    }, this);
  };
  
  Vex.Flow.JSON.prototype.draw_voices = function(voices) {
    var formatter = new Vex.Flow.Formatter().joinVoices(voices).format(voices, voices.length * this.width / 8 /*this.width - 120*/);
    _(voices).each(function(voice) {
      voice.draw(this.context, this.staves["treble"]);
    }, this);
  };

  Vex.Flow.JSON.prototype.render = function(element, options) {
    options = (options || {});
    this.width = options.width || (element.width|0) || 600; // coerce weird SVG values to ints
    this.height = options.height || (element.height|0) || 120;
    this.clef = options.clef;
    this.scale = options.scale || 1;
    this.keySignature = options.keySignature || 'C';

    this.draw_canvas(element, {
      scale: this.scale
    });
    
    this.draw_stave(this.clef, this.keySignature);
    
    if (this.voices) {
      this.draw_voices(this.stave_voices(this.voices));
    } else {
      this.draw_notes(this.stave_notes(this.notes));
    }
  };

}).call(this);

/**********************************************/
var controls;

var button = document.createElement("BUTTON");
button.innerText = "Full Screen";
var bVisible = true;
button.onclick = function full() {
  button.remove();
  THREEx.FullScreen.request();
  $("body").css('cursor', 'none');
};

document.addEventListener('webkitfullscreenchange', function(e) {
  showHide(e);
}, false);
document.addEventListener('mozfullscreenchange', function(e) {
  showHide(e);
}, false);
document.addEventListener('fullscreenchange', function(e) {
  showHide(e);
}, false);
function showHide(e) {
  var b = document.getElementById('fullscreen');
  if(!bVisible)
  {
    document.body.prepend( button );
    $("body").css('cursor', '');
    noSleep.disable();
  }
  else
  {
    noSleep.enable();
  }
  bVisible = !bVisible;
}
document.body.appendChild( button );

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
  vexCanvas.width = window.innerWidth;
	vexCanvas.height = window.innerHeight;
}

var selectedChannel = parseInt(decodeURIComponent(window.location.search.substr(1).split('=')[1]));
var h = document.createElement("H1")                // Create a <h1> element
var t = document.createTextNode("Part "+selectedChannel);     // Create a text node
h.appendChild(t);
document.body.appendChild(h); 

/******************************/
/* Let VexFlow Draw on Canvas */
/* Convert canvas to texture  */
/******************************/

var vexCanvas = document.createElement('canvas');
var ctx = vexCanvas.getContext("2d");
let scale = 3.0;
ctx.canvas.width = window.innerWidth*scale/2.0;
ctx.canvas.height = window.innerHeight*scale/2.0;
ctx.fillStyle='white';
ctx.fillRect(0,0,vexCanvas.width,vexCanvas.height);
ctx.fillStyle='black';
var json = new Vex.Flow.JSON(["C", "E", "G", "Bb"]);
json.render(vexCanvas,{scale:scale/2});
document.body.appendChild(vexCanvas);
//ctx.globalCompositeOperation='difference';
//ctx.fillStyle='white';
//ctx.fillRect(0,0,vexCanvas.width,vexCanvas.height);

//document.body.prepend( vexCanvas );
/* Code for Websocket communication */

var host = window.document.location.host;
var ws = new WebSocket('ws://' + host);
var vexStr = ""
var lastVexStr = ""
ws.onmessage = function (event) {
  var text = event.data;
  console.log(text);
  var message = JSON.parse(text);
  if(message['ch']==='metro')
  {
    var bitCount = parseInt(message['vex']);
    if(bitCount%4==0)
    {
      var ctx = vexCanvas.getContext("2d");
      ctx.fillStyle='white';
      ctx.fillRect(0,0,vexCanvas.width,vexCanvas.height);
      ctx.fillStyle='black';
      var json = new Vex.Flow.JSON(JSON.parse('{ "clef": "treble", "notes":['+vexStr+' ]}'),100) ;
      json.render(vexCanvas);
    }  
  }
  if(message['ch'].startsWith('ch'))
  {
    let channel = parseInt(message['ch'].substr(2,1))
    if(channel == selectedChannel)
    {
      bars = message['vex'];
      str = "";
      for(var bIndex = 0;bIndex<bars.length;bIndex++)
      {
        if(bIndex || str.length)
        {
          str+=', { "barnote": "true" },';
        }
        var vex = bars[bIndex];
        for(var i=0;i<vex.length;i++)
        {
          if(i)
          {
            str+=",";
          }
          var keysStr = "";
          for(var k=0;k<vex[i][0].length;k++)
          {
            if(k)
            {
              keysStr+=",";
            }
            keysStr += '"'+vex[i][0][k]+'"';
          } 
          str+='{ "duration":"'+vex[i][1]+'", "keys": ['+keysStr+']}';
        }
      }
      /*if(vexStr.length)
        vexStr+=', { "barnote": "true" },';*/
      if(lastVexStr.length==0)
      {
        vexStr = str +', { "barnote": "true" },'+ str;
      }
      else
      {
        vexStr = lastVexStr +', { "barnote": "true" },'+ str;
      }
      lastVexStr = str;
    }
  }
};

/* Examples for converting bach to json */
/* (,sssssssssssssssssssssss((6700)(6700)(6700)(6700))((6700)(6700)(6700)(6700)))((-1/4 -1/4 -1/4 -1/4)(-1/4 -1/4 -1/4 -1/4)) */
/* (,sssssssssssssssssssssss((6700)(6700)(6700)(6700))((6700)(6700)(6700)(6700)))(( 1/4 1/4 1/4 1/4)( 1/4 1/4 1/4 1/4)) */
/*
    render_vexflow("explicit-voices", {
      clef: "treble",
      voices: [
        { time: "4/4", notes: [
          { duration: "h", keys: ["C", "Eb", "F", "A"] },
          { duration: "h", keys: ["Bb", "D", "F", "A"] },
          { barnote: true },
          { duration: "q", keys: ["C", "Eb", "G", "Bb"] },
          { duration: "q", keys: ["C", "Eb", "F", "A"] },
          { duration: "h", keys: ["Bb", "D", "F", "A"] },
          { barnote: true },
          { duration: "q", keys: ["C", "Eb", "G", "Bb"] },
          { duration: "q", keys: ["C", "Eb", "F", "A"] },
          { duration: "h", keys: ["Bb", "D", "F", "A"] },
          { barnote: true },
          { duration: "q", keys: ["C", "Eb", "G", "Bb"] },
          { duration: "q", keys: ["C", "Eb", "F", "A"] },
          { duration: "h", keys: ["Bb", "D", "F", "A"] }
        ]}
      ]
    });
*/