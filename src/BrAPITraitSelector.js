/**
 * [BrAPITraitSelector description]
 */


class BrAPITraitSelector {

    constructor( brapi_endpoint, svg_container, svg_file, anatomy_structure, opts) {

        //declare variables
        this.brapi_endpoint = brapi_endpoint;
        this.svg_container =  svg_container;
        let entityList = [];
        var currentGFilter = null;
        console.log("anatomy_structure",anatomy_structure);
        //select container
        var svgContent = document.getElementById(svg_container).contentDocument;

        d3.xml(svg_file)
        .then(data => {
            d3.select("#plant_svg").node().append(data.documentElement);

            d3.selectAll('g').each(function(d,i) { 

                if(anatomy_structure[this.id]){

                    var subpart = anatomy_structure[this.id];
                    for (let i = 0; i < subpart.length; i++) {
                        console.log(subpart[i]);
                        d3.select("#" + subpart[i] ).style("opacity", 0);

                        // d3.select("#" + subpart[i] ).on("mouseover",function(d){
                        //     d3.select(this).transition()        
                        //     .duration(1000).style("opacity", 1);
                        // });
                        d3.select("#" + subpart[i] ).on("click",function(d){
                            var element = d3.select(this);
                            element.call(d3.zoom().on("zoom", function () {
                                element.attr("transform", "translate(50) scale(1 0.5)")
                              }));                   
                        });
                    }  

                    d3.select("#" +this.id ).on("click",function(d){
                        var subpart = anatomy_structure[this.id];
                        for (let i = 0; i < subpart.length; i++) {
                            console.log(subpart[i]);
                            d3.select("#" + subpart[i] )
                                .transition()        
                                .duration(500)
                                .style("opacity", 1);
                        }                        
                    });                    
                }
            });
        });

        //get brapi data
        const brapi = BrAPI(brapi_endpoint, "2.0","auth");
        const traits = brapi.traits({'pageSize':50});
        

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
            // load_attributes(entity,svgContent, function(d){
            //             //console.log("hi");
            //         });
        });
        

        function load_attributes(entity,svgContent){

            //Getting the attributes data
            if(!entity){
                return;
            }
            // console.log("entity", entity);
            var svg_entity = svgContent.getElementById(entity);

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

                //adding attributes list to entity popups on click
                svg_entity.addEventListener('click', function (event) {
                    tip.css({
                        top: event.pageY - 45,
                        left: event.pageX - 10,
                        "z-index": 999999
                    });

                    load_table("#filter_div", '#filtered_results', attributesList[entity],function(){
                        alert(":)");
                        $("#dropdown0").click();
                        $("#dropdown0").trigger("click");
                        console.log("hace algo");
                    });                   

                }, false);

                
            }
        }

        function load_table(filterDiv, filterTable, attribute_ids, callback){

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
                false
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

    }
}


export default function brapiTraitSelector(){
    return new BrAPITraitSelector(...arguments);
  };