const ImageAPILink = "https://sfasu-cdn.presence.io/organization-photos/8317246b-60de-41af-9823-4a35504099d4/"
const APILink = "https://api.presence.io/sfasu/v1/organizations"

function update() {
    document.getElementById("clubList").innerHTML = "";
    const clubData = JSON.parse(GetAPIJson(APILink));
    clubData.forEach(createClub)

}



function createClub(club,index){
    //create div
    const clubElement= document.createElement("span");
    clubElement.className = "club";

    //add link to div
    const link= document.createElement("a");
    link.href = "https://sfasu.presence.io/organization/" + club.uri;
    clubElement.appendChild(link);

    //add pic to link
    const clubPic = document.createElement("img");
    clubPic.className = "crop";
    clubPic.src = ImageAPILink + club.photoUri;
    clubPic.alt = club.uri;
    link.appendChild(clubPic);

    //put div on page
    document.getElementById("clubList").appendChild(clubElement);   
}
   
    
function GetAPIJson(url){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",url,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

          
