// JSX for ME Drawings Importer v1
// By Arcadi Garcia
// Has to be with the rest of the files in a valid CEP Adobe Extension folder

/**
 * Analyzes the Drawings folder corresponding to a
 * particular project folder and returns all the names
 * of the files inside.
 * @return {String} info The info of all the files and folders in the Drawings folders,
 *                       sorta encoded into a single string.
 *                  - Different files are separated by ","
 *                  - Different attributes are separated by "?"
 */
function analyzeDrawings() {
  var projRef = new File(app.project.path); //get project file info
  var drawFolder = projRef.parent; //get Sources folder
  var theresDraw = drawFolder.changePath("Drawings");

  if(theresDraw && drawFolder.exists){
    var info = []; //buffer where we'll store all the info
    var files = drawFolder.getFiles();

    //sort elements to get a nice numerical order
    files.sort(function(a,b){
      auxa = a.name.split("-");
      auxb = b.name.split("-");

      if(parseInt(auxa[0])!=NaN){
        auxa = parseInt(auxa[0]);
      } else {
        auxa = auxa.split(" ");
        auxa = parseInt(a[0]);
      }

      if(parseInt(auxb[0])!=NaN){
        auxb = parseInt(auxb[0]);
      } else {
        auxb = auxb.split(" ");
        auxb = parseInt(auxb[0]);
      }

      if(auxa-auxb == 0){
        return (a < b) ? -1:1;
      } else return auxa-auxb;
    });

    //loop through elements  of the Drawing folder
    for(var n=0; n<files.length;n++){
      var el = files[n], kind = null;

      //skip all psd files and 0 folder
      if(el.name.indexOf(".psd") >= 0 || el.name=="0") continue;

      //if we're dealing with a folder, let's ascertain whether it's a Drawing Folder or an Assets Folder
      if(el instanceof Folder){
        var isDrawing = false;
        //drawing process frames are named with this pattern:
        //ME XX - Drawings frame 10XX
        //so we'll basically go through all its files and see if
        //we spot any file containing "Drawings frame" in its name
        var subfiles = el.getFiles(); //get all files
        for(var m=0; m<subfiles.length; m++){
          var sub = subfiles[m];
          //if we spot a file with "Drawings frame" in its name,
          //we can guess this is a Drawing Process folder
          if(sub.fsName.indexOf("Drawings frame") >= 0){
            kind = "Drawing Process";
            isDrawing = true;
            break;
          }
        }
        //if we haven't found proof of el being a Drawing Process folder, we'll tag it as an Assets Folder
        kind = isDrawing ? "Drawing Process":"Assets Folder";
      } else kind = "File"; //if it's not a folder, it has to be a file
      info.push(el.name+"?"+kind); //add to the info array,
    }

    //Join everything into a string because we can't pass arrays or objects
    //and that's apparently that's just how the world works
    return info.join(",");
  } else return null;
}
