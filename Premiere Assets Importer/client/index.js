// JS for ME Drawings Importer v1
// By Arcadi Garcia
// Has to be with the rest of the files in a valid CEP Adobe Extension folder

(function (){
  'use strict';
  var csInterface = new CSInterface();

  // references to our html buttons and the functions they'll execute
  var analButton = document.querySelector("#analyze");
  analButton.addEventListener("click", analDrawings);
  var updateButton = document.querySelector("#update");
  updateButton.addEventListener("click", updateDrawings);

  /**
   * Analyzes the Drawings folder and updates the #files div
   */
  function analDrawings() {
    //get the files div and change the message
    var filesDiv = document.querySelector("#files");
    filesDiv.innerHTML = "<p>Analyzing...</p>";
    csInterface.evalScript("analyzeDrawings();", function(res){
      if(res == null){
        //if there's nothing to report, let's make sure the user knows
        filesDiv.innerHTML = "<p> Wasn't able to find the Drawings folder! Make sure it's on the same folder as the project file. </p>"
      } else{
        //ok so first let's parse this string back into something usable
        res = res.split(",");

        //we create a table to put our data in
        var filesInfo = document.createElement("table");
        filesInfo.innerHTML = "<tr><th></th><th> Name </th> <th> Type </th>";

        for(var n=0; n<res.length; n++){
          var elems = res[n].split("?"); //we split the data of each individual element
          var indiv = document.createElement("tr");
          var want = (elems[2] == 'true')? "checked":''; //check if we want to have this imported by default
          indiv.className = "elem";

          indiv.innerHTML = '<td><input type="checkbox" '+ want +'> </td> <td><p>' + elems[0] + '</p></td><td><p><i>'+ elems[1] + "</i></p></td>"; //put everything together as an html string for us to use
          filesInfo.appendChild(indiv);
        }

        filesDiv.innerHTML = "";
        filesDiv.appendChild(filesInfo);
      }

    });
  }

  /**
   * Imports all the selected drawings, assets and drawing processes
   */
   function updateDrawings() {
     //get checked checkboxes
     var checkedBoxes = document.querySelectorAll('input:checked');
     var whatToImport = [];

     for(var n=0; n<checkedBoxes.length; n++){
       var row = checkedBoxes[n].parentNode.parentNode.children; //get the info of the rows
       whatToImport.push(row[1].textContent + "?" + row[2].textContent);
     }
     whatToImport = whatToImport.join(",");
     //next we sent all this data to the JSX so it can do its importing magic
     //we turn our whatToImport object into a JSON string
     csInterface.evalScript("updateDrawings(\"" + whatToImport + "\");", analDrawings()); //and re-analyze drawings after running the script
   }

   analDrawings(); //analyze drawings as soon as the panel loads
}());
