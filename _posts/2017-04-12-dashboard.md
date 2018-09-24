---
layout: post
title: Dashboard
tags: [snik, ontology, label,length]
date: 2017-04-12
use_labellanguages: true
use_sgvizler: true
use_sgvizler_chart: true
---

## Types
Number of classes per type over all the subontologies. Hover over slices to see their absolute number.

<div id="subtops"
         data-sgvizler-query="
select replace(str(COALESCE(?subTop, 'none')),'http://www.snik.eu/ontology/meta/','meta:') count(?class)
from <http://www.snik.eu/ontology>
{
 ?class a owl:Class.
 OPTIONAL {?class meta:subTopClass ?subTop.}
}"
         data-sgvizler-chart="google.visualization.PieChart"
         style="width:100%; height:400px;">
</div>

## Label Languages
Number of classes that have labels in German, English, both or none of them.

<div id="labellanguages"></div>

## Ontology Size (Classes)
Number of classes per subontologies. Hover over slices to see their absolute number.

<div id="ontologysizeclass"
         data-sgvizler-query="
select replace(str(?ontology),'http://www.snik.eu/ontology/','') count(?x)
from <http://www.snik.eu/ontology>
{
 ?ontology ov:defines ?x.
 ?x a owl:Class.
}"
   data-sgvizler-chart="google.visualization.PieChart"
   style="width:100%; height:400px;">
</div>

## Ontology Size (Properties)
Number of classes per subontologies. Hover over slices to see their absolute number.

<div id="ontologysizeproperty"
         data-sgvizler-query="
select replace(str(?ontology),'http://www.snik.eu/ontology/','') count(?x)
from <http://www.snik.eu/ontology>
{
 ?ontology ov:defines ?x.
 {?x a rdf:Property.} UNION {?x a owl:DataTypeProperty.} UNION {?x a owl:ObjectProperty.}
}"
   data-sgvizler-chart="google.visualization.PieChart"
   style="width:100%; height:400px;">
</div>

## Ontology Size (Triples)
Number of triples per subontologies. Hover over slices to see their absolute number.

<div id="ontologysizetriple"
     data-sgvizler-query="
select replace(str(?g), 'http://www.snik.eu/ontology/','') count( * )
from <http://www.snik.eu/ontology>
{
 graph ?g {?s ?p ?o.}
 filter(regex(str(?g),'http://www.snik.eu/ontology/'))
}"
   data-sgvizler-chart="google.visualization.PieChart"
   style="width:100%; height:400px;">
</div>


## Ontology Size (Interlinks)
Number of interlinks per link type. Hover over slices to see their absolute number.

<div id="ontologysizelink"
     data-sgvizler-query="
select replace(str(?p), 'http://www.w3.org/2004/02/skos/core#','') count( * )
from <http://www.snik.eu/ontology>
{
 ?s ?p ?o.
 filter(regex(str(?p),'http://www.w3.org/2004/02/skos/core#'))
 filter(str(?p)!='http://www.w3.org/2004/02/skos/core#definition')
 filter(str(?p)!='http://www.w3.org/2004/02/skos/core#altLabel')
}"
   data-sgvizler-chart="google.visualization.PieChart"
   style="width:100%; height:400px;">
</div>


## Class Hierarchy
TreeMap of the class hierarchy. Larger rectangles have more subclasses. Click on a class to see it's subclasses .
<div id="hierarchy"
       data-sgvizler-query="
select replace(str(?sub),'http://www.snik.eu/ontology/','') replace(str(sample(?super)),'http://www.snik.eu/ontology/','') count(?sub)

from <http://www.snik.eu/ontology/meta>
from <http://www.snik.eu/ontology/ob>
from <http://www.snik.eu/ontology/bb>
from <http://www.snik.eu/ontology/he>
{
  ?sub a owl:Class.
  # must be connected to the top
  filter exists {?sub rdfs:subClassOf* meta:Top.}
 OPTIONAL
 {
  ?sub rdfs:subClassOf ?super.
  ?super a owl:Class.
 }
}"
       data-sgvizler-chart="google.visualization.TreeMap"
       style="width:800px; height:400px;"></div>

## Label Length
Number of labels of a certain length. Most common length is around 15 characters. Labels should normally be shorter than 25 characters to avoid overcrowding the visualization.

<div id="labellength"
 data-sgvizler-query="
select strlen(?l) as ?label_length count(?l) as ?number_of_labels
from <http://www.snik.eu/ontology>
{
 ?class a owl:Class.
 ?class rdfs:label ?l.
} group by strlen(?l) order by asc(strlen(?l))"
         data-sgvizler-chart="google.visualization.AreaChart"
         style="width:100%; height:400px;">
</div>
