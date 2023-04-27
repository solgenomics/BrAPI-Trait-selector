/**
 * [BrAPITraitSelector description]
 */


class BrAPITraitSelector {

    constructor( brapi_endpoint, svg_container, opts) {

        //declare variables
        this.brapi_endpoint = brapi_endpoint;
        this.svg_container =  svg_container;
        let entityList = [];
        var currentGFilter = null;

        //select container
        var svgContent = document.getElementById(svg_container).contentDocument;


        //get brapi data
        const brapi = BrAPI(brapi_endpoint, "2.0","auth");
        const traits = brapi.traits({'pageSize':50});
        
        // load_table("#filter_div", "1");

        ///get non duplicated entities
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
                        //console.log("hi");
                    });
        });
        

        function load_attributes(entity,svgContent){
            
            //Getting the attributes data
            if(!entity){
                return;
            }
            console.log("entity", entity);
            var svg_entity = svgContent.getElementById(entity);
            // svg_entity.setAttributeNS(null,"x",50);

            if(svg_entity){

                var traitList=new Object();
                traitList[entity]=[];
                var attributesList=new Object();
                attributesList[entity]=[];

                // var attributes = brapi.search_attributes({
                var attributes = brapi.simple_brapi_call({
                        'defaultMethod': 'post',
                        'urlTemplate': '/search/attributes',
                        'params': {"traitEntities":[entity]},
                        // 'params': {"traitEntities":["fruits"]},
                });
                
                attributes.map(function(r){ 

                    var attributes = r.data;
                    attributes.forEach(attribute => {
                        attribute.trait.forEach(trait =>{
                            if(entity != trait.entity) return;
                            traitList[entity].push(trait.traitName);
                            attributesList[entity].push(attribute.attributeDbId);
                        });
                    });
                });

                var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                var name = svg_entity.getAttributeNS(null,"name");
                title.textContent = name;
                svg_entity.appendChild(title);                    
                
                //creates div for entity popups
                var tip = $('<div id="tsTip_'+ entity +'" class="tsTip" ></div>').appendTo('body').hide(),
                tipW = 100,
                tipH = 100;

                //adding mouse events to each entity                
                svg_entity.addEventListener('mouseenter', function (event) { 
                    const { scale, x, y } = getTransformParameters(svg_entity);
                    let dScale = 0.1;
                    svg_entity.style.transform = getTransformString(scale + dScale, x, y);
                 });

                svg_entity.addEventListener('mouseleave', function (event) { 
                    const { scale, x, y } = getTransformParameters(svg_entity);
                    let dScale = -0.1;
                    svg_entity.style.transform = getTransformString(scale + dScale, x, y);
                });

                //adding attributes list to entity popups on click
                svg_entity.addEventListener('click', function (event) {
                    tip.css({
                        top: event.pageY - 45,
                        left: event.pageX - 10,
                        "z-index": 999999
                    });

                    //adding svg popups with atrributes data string

                    // var stringHTML  ="Traits:";
                    // for( var i = 0; i < traitList[entity].length ; i++ ){
                    //     stringHTML += "<a href='#'>" + traitList[entity][i] + "</a><br>";
                    // }
                    // document.getElementById("tsTip_" + entity).innerHTML =  stringHTML + "<br><button id='x' onclick='alert();'>X</button>";
                    
                    // tip.show();
                    console.log("e",entity, attributesList[entity]);

                    
                    load_table("#filter_div", '#filtered_results', attributesList[entity]);


                }, false);

                
            }
        }

        function load_table(filterDiv, filterTable, attribute_ids){

            if ($.fn.dataTable.isDataTable(filterTable)) { 
                $(filterTable).DataTable().clear().destroy();
                $(filterTable).empty();                       
            };

            // var attributevalues = brapi.search_attributevalues({
            var attributevalues = brapi.simple_brapi_call({
                    'defaultMethod': 'post',
                    'urlTemplate': '/search/attributevalues',
                    // 'params': {"attributeDbIds":[153]} //attribute_ids }
                    'params': {"attributeDbIds": attribute_ids },
                    'behavior': 'fork'
            });

            currentGFilter = GraphicalFilter(
                attributevalues,
                baseTraits,
                baseCols,
                ["Accession","Accession Id"],
                undefined,
            );
            currentGFilter.draw(
                filterDiv,
                filterTable,
            );

            function baseTraits(d) { 
                var traits = {}
                traits[d.attributeName] = d.value;
                return traits;
            }
            function baseCols(d){
                return {
                'Accession Id':d.germplasmDbId,
                'Accession':d.germplasmName,
                }
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