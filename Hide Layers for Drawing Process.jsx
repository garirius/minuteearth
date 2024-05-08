// Hide Layers for Drawing Process.jsx v3
// Updated 2024-05-08 to support multiple selection
// Creates a Hide All layer mask for all selected layers (or layers in the
// selected folders and subfolders) and creates an "invisible" duplicate.

/** addMask
 * Creates a Hide All mask for a layer
 * @param {Layer} lay The layer to hide
 */
function addMask(lay){
  var prev = activeDocument.activeLayer;
  activeDocument.activeLayer = lay;
  try{
    var idMk = charIDToTypeID( "Mk  " );
    var desc2 = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
    var idChnl = charIDToTypeID( "Chnl" );
    desc2.putClass( idNw, idChnl );
    var idAt = charIDToTypeID( "At  " );
    var ref1 = new ActionReference();
    var idChnl = charIDToTypeID( "Chnl" );
    var idChnl = charIDToTypeID( "Chnl" );
    var idMsk = charIDToTypeID( "Msk " );
    ref1.putEnumerated( idChnl, idChnl, idMsk );
    desc2.putReference( idAt, ref1 );
    var idUsng = charIDToTypeID( "Usng" );
    var idUsrM = charIDToTypeID( "UsrM" );
    var idHdAl = charIDToTypeID( "HdAl" );
    desc2.putEnumerated( idUsng, idUsrM, idHdAl );
    executeAction( idMk, desc2, DialogModes.NO );
  } catch(e){}
  activeDocument.activeLayer = prev;
}
​
/** loopThrough
 * Loops through a layer set and hides all its layers
 * @param {LayerSet} set The layer set to loop through
 */
function loopThrough(set){
  if(set instanceof LayerSet){ //check if it's actually a LayerSet
    var lays = set.layers;
    for(var n=0; n<lays.length; n++){ //loop through the layers
      var el = lays[n];
      switch(el.typename){
        case 'LayerSet': //if there's a LayerSet inside, loop through it
          loopThrough(el);
          break;
        case 'ArtLayer': //if it's a normal layer, just hide it
          activeDocument.activeLayer = el;
          addMask(el);
          break;
      }
    }
  } else return null;
}
​
/** getSelectedLayers
 * Gets all selected layers because apparently there's no easy way
 * to do this with Photoshop's ExtendScript thing.
 * @return {Layer[]} All selected layers
 */
function getSelectedLayers() {
  var A=[];
  var desc11 = new ActionDescriptor();
  var ref9 = new ActionReference();
  ref9.putClass( stringIDToTypeID('layerSection') );
  desc11.putReference( charIDToTypeID('null'), ref9 );
  var ref10 = new ActionReference();
  ref10.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
  desc11.putReference( charIDToTypeID('From'), ref10 );
  executeAction( charIDToTypeID('Mk  '), desc11, DialogModes.NO );
  var gL = activeDocument.activeLayer.layers;
  for(var i=0;i<gL.length;i++){
   A.push(gL[i]);
  }
  executeAction(charIDToTypeID('undo'), undefined, DialogModes.NO);
  return A;
};

/**********************************/
/*     OK!! LET'S START!!         */
/**********************************/
var layeroos = getSelectedLayers(); //gets selected layers
var doc = app.activeDocument;

//find topmost layer to place stuff on top of
var daddy = layeroos[0].parent;
if(daddy instanceof Document) daddy = layeroos[0];
else {
  //finds the outermost parent before the root folder
  while(daddy.parent instanceof LayerSet) daddy = daddy.parent;
} 

//create mergeable folder above daddy
doc.layerSets.add();
above = doc.layers[0];
above.move(daddy, ElementPlacement.PLACEBEFORE);
above.name = 'invisible'; above.opacity = 20;

//create dummy group to circumvent photoshop ass-backwards architecture
above.layerSets.add()
var dummy = above.layerSets[0];

alert(dummy.name);
//iterate through each selected layer
for(var n=0; n<layeroos.length; n++){
  var el = layeroos[n];    
  //create the invisible duplicate above daddy
  var dupel = el.duplicate(dummy,ElementPlacement.PLACEBEFORE);
  if(dupel instanceof LayerSet) dupel = dupel.merge();
}
dummy.remove();
above.merge();

//loop again through layers, this time for hiding them!
for(var n=0; n<layeroos.length; n++){
  var lay = layeroos[n];

  if(lay instanceof LayerSet){//if this is a folder, loop through all its layers
    loopThrough(lay);
  } else {//if it's just a layer, hide it
    if(!lay.isBackgroundLayer && !lay.grouped) addMask(lay);
  }
}

//done! thanks for reading this! have a nice day!
