/**
 * [BrAPITraitSelector description]
 */


class BrAPITraitSelector {

    constructor( brapi_endpoint, svg_container, opts) {

        //declare variables
        this.brapi_endpoint = brapi_endpoint;
        this.svg_container =  svg_container;
        let entityList = [];

        //select container
        var svgContent = document.getElementById(svg_container).contentDocument;


        //get brapi data
        const brapi = BrAPI(brapi_endpoint, "2.0","auth");
        const traits = brapi.traits({'pageSize':10});
              

        ///get non suplicated entities
        traits.map((trait)=>{
            var entity = trait.entity;
            if(!entityList.includes(entity) && entity != ""){
                entityList.push(entity);
                return entity;
            } else{
                return;
            }
        }).map(entity=>{

            //load attributes by entity
            load_attributes(entity,svgContent, function(d){
                        console.log("hi");
                    });
        });
        

        function load_attributes(entity,svgContent){

            //Getting the attributes data
            if(!entity){
                return;
            }
            console.log("entity", entity);
            var rect = svgContent.getElementById(entity);
            // rect.setAttributeNS(null,"x",50);

            if(rect){

                var attributesListHTML = [];

                var attributes = brapi.search_attributes({
                    "traitEntities":[entity],
                    "attributeNames":[attribute],
                    'pageSize': 50
                  });    
                
                attributes.map(function(r){
                    var attributesList = r.data.trait;

                    //adding attributes list string to div
                    attributesListHTML[entity] = "Traits:<br>";

                    for( var i = 0; i < attributesList.length ; i++ ){
                        attributesListHTML[attributesList[i].locationType] += "<a href='#'>" + attributesList[i].locationName + "</a><br>";
                    }
                });

                
              
                var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                var name = rect.getAttributeNS(null,"name");
                title.textContent = name;
                rect.appendChild(title);                    
                
                //creates div for entity popups
                var tip = $('<div id="tsTip_'+ entity +'" class="tsTip" ></div>').appendTo('body').hide(),
                tipW = 100,
                tipH = 100;

                //adding mouse events to each entity                
                rect.addEventListener('mouseenter', function (event) { 
                    const { scale, x, y } = getTransformParameters(rect);
                    let dScale = 0.1;
                    rect.style.transform = getTransformString(scale + dScale, x, y);
                 });

                rect.addEventListener('mouseleave', function (event) { 
                    const { scale, x, y } = getTransformParameters(rect);
                    let dScale = -0.1;
                    rect.style.transform = getTransformString(scale + dScale, x, y);
                });

                //adding attributes list to entity popups on click
                rect.addEventListener('click', function (event) {
                    tip.css({
                        top: event.pageY - 45,
                        left: event.pageX - 10
                    });
                    //adding svg popups with atrributes data string
                    document.getElementById("tsTip_" + entity).innerHTML =  attributesListHTML[entity] + "<button>OK</button>";
                    tip.show();           
                }, false);
            }
        }

        //zooming in and out entity
        const getTransformParameters = (element) => {
            const transform = element.style.transform;
            let scale = 1,
              x = 0,
              y = 0;
            if (transform.includes("scale"))
              scale = parseFloat(transform.slice(transform.indexOf("scale") + 6));
            if (transform.includes("translateX"))
              x = parseInt(transform.slice(transform.indexOf("translateX") + 11));
            if (transform.includes("translateY"))
              y = parseInt(transform.slice(transform.indexOf("translateY") + 11));
            return { scale, x, y };
          };

          const getTransformString = (scale, x, y) =>
          "scale(" + scale + ") " + "translateX(" + x + "%) translateY(" + y + "%)";

    }
}


export default function brapiTraitSelector(){
    return new BrAPITraitSelector(...arguments);
  };