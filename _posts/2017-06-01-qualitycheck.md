---
layout: post
title: Quality Check
tags: [snik, ontology, label,length]
date: 2017-06-01
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
<input type="button" id="sgvizler-button-subtop-multiple" value="List Classes with Multiple Subtops" />
<div id="sgvizler-div-subtop-multiple"
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

<h3>Inconsistent Subtop with Subclass</h3>
<div>
<h4>Situation</h4>
In addition to direct subclass relations, we model the transitively implied subclass relation to a subtop using the meta:subtop relation.
Other knowledge bases may handle this differently, for example DBpedia always explicitly defines all superclasses.
<h4>Problem</h4>
If A is subclass of B and A and B have different disjoint superclasses C and D, this implies that A is empty, similar to the multiple subtops problem.
<h4>Solution</h4>
Manually unify the subtops of the subclass-superclass pairs below.
<br/>
<input type="button" id="sgvizler-button-subtop-subclass" value="List Classes with Subtop Inconsistent with that of its Subclass" />
<div id="sgvizler-div-subtop-subclass"
         data-sgvizler-query="
select ?sub ?subtype ?super ?supertype
from <http://www.snik.eu/ontology>
{
 owl:Class ^a ?sub,?super.
 ?sub rdfs:subClassOf ?super.
 ?sub meta:subTopClass ?subtype.
 ?super meta:subTopClass ?supertype.
 filter(?subtype!=?supertype)
}
">
</div>
</div>

<h3>SKOS Link to Different Subtop</h3>
<div>
<h4>Situation</h4>
The different SNIK subontologies are linked mostly using <a href=":closeMatch">skos:closeMatch</a>, <a href=":narrowMatch">skos:narrowMatch</a> and <a href=":broadMatch">skos:broadMatch</a>, which which imply owl:equivalentClass, rdfs:subClassOf and the inverse of rdfs:subClassOf.
<h4>Problem</h4>
For the same reasons mentioned for multiple subtops and inconsistent subtop, we assume an error if the ends of a link have a different subtop.
<h4>Solution</h4>
Remove all interlinks between classes with different subtops.
<br/>
<input type="button" id="sgvizler-button-subtop-skos" value="List Classes with Multiple Subtops" />
<div id="sgvizler-div-subtop-skos"
         data-sgvizler-query="
select ?class1 ?type1 ?relation ?class2 ?type2
from <http://www.snik.eu/ontology>
{
 owl:Class ^a ?class1,?class2.
 ?class1 meta:subTopClass ?type1.
 ?class2 meta:subTopClass ?type2.
 filter(?type1!=?type2)
 ?class1 ?relation ?class2.
 filter(regex(str(?relation),'http://www.w3.org/2004/02/skos/core#'))
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
<input type="button" id="sgvizler-button-cycle" value="List Classes on Subclass Cycles" />
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
As this creates a very unbalanced tree, you can display those classes below and try to find a more specific superclass for them.
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

<h3>Class URL Naming Convention Violations</h3>
<div>
<h4>Situation</h4>
Class URLs should conform to UpperCamelCase.
<h4>Problem</h4>
Naming conventions weren't clearly set from the beginning and some pecularities are not widely known, for example abbreviations such as IbmMachine, not IBMMachine.
<h4>Solution</h4>
Manually correct offending class URLs.
<br/>
<input type="button" id="sgvizler-button-naming" value="List Class Naming Convention Violations" />
<div id="sgvizler-div-naming"
         data-sgvizler-query="
select ?class
FROM <http://www.snik.eu/ontology>
{
 ?class a owl:Class.
 filter(!regex(str(?class),'([A-Z0-9][a-z0-9]+)+'))
}
">
</div>
</div>

<h3>Property URL Naming Convention Violations</h3>
<div>
<h4>Situation</h4>
Property URLs should conform to lowerCamelCase.
<h4>Problem</h4>
Naming conventions weren't clearly set from the beginning and some pecularities are not widely known, for example abbreviations such as updatesAtm, not updatesATM.
<h4>Solution</h4>
Manually correct offending property URLs.
<br/>
<input type="button" id="sgvizler-button-naming" value="List Property Naming Convention Violations" />
<div id="sgvizler-div-naming"
         data-sgvizler-query="
select ?property
FROM <http://www.snik.eu/ontology>
{
 {?property a owl:ObjectProperty.} UNION {?property a owl:DatatypeProperty.}
 filter(!regex(str(?property),'^[a-z]+([A-Z][a-z0-9]+)*'))
}
">
</div>
</div>

<!-- ** workaround for Atom editor syntax highlighting problem -->

<h3>Missing Definition</h3>
<div>
<h4>Situation</h4>
Every class should have a definition from the book.
<h4>Problem</h4>
Some don't.
<h4>Solution</h4>
Try to find a definition in the source.
<br/>
<input type="button" id="sgvizler-button-definition" value="List Classes with Missing Definition" />
<div id="sgvizler-div-definition"
         data-sgvizler-query="
select ?class
FROM <http://www.snik.eu/ontology>
{
 ?class a owl:Class.
 OPTIONAL {?class skos:definition ?def.}
 FILTER(!BOUND(?def) OR str(?def)='')
}
">
</div>
</div>

<h3>Literals with Semicolons</h3>
<div>
<h4>Situation</h4>
We use semicolons for multiple properties in our extraction tables to hold multiple values.
<h4>Problem</h4>
Semicolons are rarely used in the textbooks, especially for short strings and outside of definitions.
Thus they hint at semicolons being used at the wrong place or at errors in the conversion script.
<h4>Solution</h4>
Generate all literals containing semicolons except those from definitions of more than 100 characters.
<br/>
<input type="button" id="sgvizler-button-semicolon" value="List Literals with Semicolons" />
<div id="sgvizler-div-semicolon"
         data-sgvizler-query="
select ?class ?property ?literal
FROM <http://www.snik.eu/ontology>
{

 ?class ?property ?literal.
 filter(!(?property=skos:definition AND strlen(?literal)>100))
 FILTER(regex(str(?literal),';'))
}
">
</div>
</div>
<h3>Classes with too many subclasses</h3>
<div>
<h4>Situation</h4>
The subclass hierarchy should ideally be a more or less balanced tree.
<h4>Problem</h4>
In practice, the hierarchy is too flat.
<h4>Solution</h4>
List all classes with more than 20 subclasses.
<br/>
<input type="button" id="sgvizler-button-imbalanced-count" value="List Classes with too many subclasses" />
<div id="sgvizler-div-imbalanced-count"
         data-sgvizler-query="
select ?super count(?sub) as ?sub_count
from <http://www.snik.eu/ontology>
{
 owl:Class ^a ?sub,?super.
 ?sub rdfs:subClassOf ?super.
} group by ?super having (count(?sub) > 20) order by desc(count(?sub))
">
</div>

<input type="button" id="sgvizler-button-imbalanced-subclasses" value="List Subclasses of Classes with too many Subclasses" />
<div id="sgvizler-div-imbalanced-subclasses"
         data-sgvizler-query="
select ?sub
from <http://www.snik.eu/ontology>
{
 ?sub rdfs:subClassOf ?super
{
 select ?super
{
 owl:Class ^a ?sub,?super.
 ?sub rdfs:subClassOf ?super.
} group by ?super having (count(?sub) > 20)
}
}
">
</div>
</div>

<h3>No Restriction</h3>
<div>
<h4>Situation</h4>
Classes are connected to other classes mostly by the subclass hierarchy and by restrictions.
<h4>Problem</h4>
Some classes are isolated from all others, limiting their use and preventing them from being connected to the vizualization graph.
<h4>Solution</h4>
List all classes that are not connected to other classes by restrictions.
Because we already covered the hierarchy, we are not taking it into account here.
Because there are over 1000 of those cases, we only list the first 100.
They are not necessarily faulty but it may be worthy to investigate if they can be connected in some way.
<br/>
<input type="button" id="sgvizler-button-isolated" value="List Unrestricted Classes" />
<div id="sgvizler-div-isolated"
         data-sgvizler-query="
select ?class

FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
FROM <http://www.snik.eu/ontology/ciox>
FROM <http://www.snik.eu/ontology/he>
FROM <http://www.snik.eu/ontology/it>
{
 ?class a owl:Class.
 filter not exists
 {
  ?class2 a owl:Class.
  {?class rdfs:subClassOf [a owl:Restriction; ?p ?class2].} UNION
  {?class2 rdfs:subClassOf [a owl:Restriction; ?p ?class].}
 }
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

Note: No table is shown when there is an empty result.
