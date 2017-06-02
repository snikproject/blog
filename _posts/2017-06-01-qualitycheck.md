---
layout: post
title: Quality Check
tags: [snik, ontology, label,length]
date: 2017-04-12
use_sgvizler: true
use_sgvizler_table: true
use_jquery_ui: true
---

<div id="accordion">
<h3>Multiple Subtops</h3>
<div>
<h4>Situation</h4>
There are three immediate subclasses of meta:Top ("subtops"): Function, Role and Entity Type.
<h4>Problem</h4>
As they are disjoint, any subclass of more than one of them would be empty, which we assume to be an error and thus show here.
<h4>Solution</h4>
Automatically generate offending classes below and manually remove all but one of the subtop statements for each of them.
<br/>
<input type="button" id="sgvizler-button-subtop" value="List Classes with Multiple Subtops" />
<div id="sgvizler-div-subtop"
         data-sgvizler-query="
select ?class ?type1 ?type2
from <http://www.snik.eu/ontology>
{
?class meta:subTopClass ?type1, ?type2.
filter(?type1!=?type2)
filter(str(?type1)<str(?type2))
}
">
</div>
</div>

<h3>Subclass Cycles</h3>
<div>
<h4>Situation</h4>
Classes are sets of invidivuals and can be subclasses (subsets) of other classes.
<h4>Problem</h4>
Subclass cycles (A subclass of B ... subclass of A) collapse all members of the cycle to the same set, which is assumed to be unintentional.
<h4>Solution</h4>
Find subclass cycles below and and manually remove at least one of them.
Because of the limitiations of SPARQL 1.1 property paths, we cannot select the full cycle but only give all pairs of classes on a cycle.
<br/>
<input type="button" id="sgvizler-button-cycle" value="List Classes with Multiple Subtops" />
<div id="sgvizler-div-cycle"
         data-sgvizler-query="
select distinct ?class ?class2
{
 owl:Class ^a ?class,?class2.
 ?class rdfs:subClassOf+ ?class2.
 ?class2 rdfs:subClassOf+ ?class.
}
">
</div>
</div>

<h3>Missing superclass</h3>
<div>
<h4>Situation</h4>
For easier exploration, visualization and understanding, we want to group all our classes in a more or less balanced tree based on the subclass/superclass relation.
<h4>Problem</h4>
Some classes don't have a specified superclass and thus are not connected to the rest of the hierarchy.
<h4>Solution</h4>
Because nearly all have a subtop statement, we use this automatically to add a superclass statement to the graph <code>http://www.snik.eu/ontology/virtual</code> for classes that don't have one already.
As this create a very unbalanced tree, you can display those classes below and try to find a more specific superclass for them.
<br/>
<input type="button" id="sgvizler-button-missingsuperclass" value="List Classes with Missing Superclass" />
<div id="sgvizler-div-missingsuperclass"
         data-sgvizler-query="
select ?class ?subtop
from <http://www.snik.eu/ontology/ob>
from <http://www.snik.eu/ontology/bb>
from <http://www.snik.eu/ontology/ciox>
from <http://www.snik.eu/ontology/he>
from <http://www.snik.eu/ontology/it>
{
?class a owl:Class.
filter not exists {?class rdfs:subClassOf [].}
OPTIONAL{?class meta:subTopClass ?subtopp.}
bind(if(bound(?subtopp),?subtopp,'none') as ?subtop)
}
">
</div>
</div>

<h3>Undefined Objects</h3>
<div>
<h4>Situation</h4>
If a concept is used as the object in some triple, then it should have its own attributes (occur as a subject).
<h4>Problem</h4>
Sometimes concepts occur as only as an object but not as a subject.
<h4>Solution</h4>
The responsible extractors for the respective subontologies need to add statements for the objects listed below.
<br/>
<input type="button" id="sgvizler-button-undefinedobject" value="List Classes with Undefined Restriction Object" />
<div id="sgvizler-div-undefinedobject"
         data-sgvizler-query="
select distinct ?targetNode
from <http://www.snik.eu/ontology/meta>
from <http://www.snik.eu/ontology/ob>
from <http://www.snik.eu/ontology/bb>
from <http://www.snik.eu/ontology/ciox>
from <http://www.snik.eu/ontology/he>
from <http://www.snik.eu/ontology/it>
{
 ?resource      a owl:Class.
 filter not exists { ?targetNode    a owl:Class.}
 filter(regex(str(?targetNode),'http://www.snik.eu/ontology/'))
 {
  ?resource     rdfs:subClassOf ?restriction.
  ?restriction  a owl:Restriction;
                owl:onProperty ?p.
  {?restriction owl:someValuesFrom ?targetNode.} UNION {?restriction owl:allValuesFrom ?targetNode.}
 }
 UNION
 {
  ?p            rdfs:domain ?resource.
  ?p            rdfs:range ?targetNode.
}
} order by asc(?targetNode)

">
</div>
</div>

<h3>Domain Violation</h3>
<div>
<h4>Situation</h4>
Each SNIK property has a domain that defines allowed subjects.
<h4>Problem</h4>
Some classes are used as a subject for a triple without being a direct or transitive subclass of the defined domain of the property.
<h4>Solution</h4>
The offending triples should be removed or remodelled to conform to the range.
<br/>
<input type="button" id="sgvizler-button-domain" value="List Domain Violations" />
<div id="sgvizler-div-domain"
         data-sgvizler-query="
select ?s ?p ?o ?domain
FROM <http://www.snik.eu/ontology/meta>
FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
FROM <http://www.snik.eu/ontology/he>
FROM <http://www.snik.eu/ontology/it>
FROM <http://www.snik.eu/ontology/ciox>
{
 graph <http://www.snik.eu/ontology/meta> {?p rdfs:domain ?domain.}

 ?s ?p ?o.
 filter not exists {?s a/rdfs:subClassOf* ?domain.}
}
">
</div>
</div>

<h3>Range Violation</h3>
<div>
<h4>Situation</h4>
Each SNIK property has a range that defines allowed objects.
<h4>Problem</h4>
Some classes are used as an object for a triple  without being a direct or transitive subclass of the defined range of the property.
<h4>Solution</h4>
The offending triples should be removed or remodelled to conform to the range.
<br/>
<input type="button" id="sgvizler-button-range" value="List Range Violations" />
<div id="sgvizler-div-range"
         data-sgvizler-query="
select ?s ?p ?o ?range
FROM <http://www.snik.eu/ontology/meta>
FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
FROM <http://www.snik.eu/ontology/he>
FROM <http://www.snik.eu/ontology/it>
FROM <http://www.snik.eu/ontology/ciox>
{
 graph <http://www.snik.eu/ontology/meta> {?p rdfs:range ?range.}

 ?s ?p ?o.
 filter not exists {?o a/rdfs:subClassOf* ?range.}
}
">
</div>
</div>

<!--
<h3>Accordion Section</h3>
<div>
<h4>Situation</h4>
<h4>Problem</h4>
<h4>Solution</h4>
<br/>
<input type="button" id="sgvizler-button-..." value="..." />
<div id="sgvizler-div-..."
         data-sgvizler-query="
...
">
</div>
</div>
-->

</div>