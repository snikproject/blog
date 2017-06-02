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
Automatically generate offending classes below and manually remove all but one of them.
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

<h3>Missing subClassOf</h3>
<div>
<h4>Situation</h4>
For easier exploration, visualization and understanding, we want to group all our classes in a more or less balanced subclass tree.
<h4>Problem</h4>
Some classes don't have a specified superclass and thus are not connected to the rest of the hierarchy.
<h4>Solution</h4>
Because nearly all have a subtop statement, we use this automatically to add a subClassOf statement to the graph <code>http://www.snik.eu/ontology/virtual</code> for classes that don't have one already.
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
OPTIONAL{?class meta:subTopClass ?subtop.}
}
">
</div>
</div>

<h3>Undefined Objects</h3>
<div>
<h4>Situation</h4>
Relations between our classes are modelled using OWL restrictions, mostly <code>owl:someValuesFrom</code> and <code>owl:allValuesFrom</code>
<h4>Problem</h4>
<h4>Solution</h4>
<br/>
<input type="button" id="sgvizler-button-undefinedobject" value="List Classes with Undefined Restriction Object" />
<div id="sgvizler-div-undefinedobject"
         data-sgvizler-query="
select distinct ?targetNode ?label ?range
from <http://www.snik.eu/ontology/ob>
from <http://www.snik.eu/ontology/bb>
from <http://www.snik.eu/ontology/ciox>
from <http://www.snik.eu/ontology/he>
from <http://www.snik.eu/ontology/it>
{
 ?resource      a owl:Class.
 filter not exists { ?targetNode    a owl:Class.}
 {
  ?resource     rdfs:subClassOf ?restriction.
  ?restriction  a owl:Restriction;
                owl:onProperty ?p.
  {?restriction owl:someValuesFrom ?targetNode.} UNION {?restriction owl:allValuesFrom ?targetNode.}
}
">
</div>
</div>

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

</div>
