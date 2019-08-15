// JS for ME Drawings Importer v1
// By Arcadi Garcia
// Has to be with the rest of the files in a valid CEP Adobe Extension folder

(function (){
  'use strict';
  /* 1) Create an instance of CSInterface. */
  var csInterface = new CSInterface();

  /* 2) Make a reference to your HTML button and add a click handler. */
  var analButton = document.querySelector("#analyze");
  analButton.addEventListener("click", analDrawings);

  /**
   * Analyzes the Drawings folder and updates the #files div
   */
  function analDrawings() {
    var filesDiv = document.querySelector("#files");
    filesDiv.innerHTML = "<p>Analyzing...</p>";
    csInterface.evalScript("analyzeDrawings();", function(res){
      if(res == null){
        filesDiv.innerHTML = "<p> Wasn't able to find the Drawings folder! Make sure it's on the same folder as the project file. </p>"
      } else{
        //ok so first let's parse this string back into something usable
        res = res.split(",");
        var filesInfo = document.createElement("table");
        filesInfo.innerHTML = "<tr><th></th><th> Name </th> <th> Type </th>";

        for(var n=0; n<res.length; n++){
          var elems = res[n].split("?");
          var indiv = document.createElement("tr");
          indiv.className = "elem";
          indiv.innerHTML = '<td><input type="checkbox" checked> </td> <td><p>' + elems[0]+ '</p></td><td><p><i>'+ elems[1] + "</i></p></td>";
          filesInfo.appendChild(indiv);
        }

        filesDiv.innerHTML = "";
        filesDiv.appendChild(filesInfo);
      }

    });
  }
}());
