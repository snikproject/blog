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
FROM <http://www.snik.eu/ontology>
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
FROM <http://www.snik.eu/ontology>
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

<h3>subClassOf and component</h3>
<div>
<h4>Situation</h4>
In addition to the subclass relation, we also have the similar but different component relations.
<h4>Problem</h4>
If A is subclass of B and A is also a component of B (or vice versa in the other direction), this seems syntactically wrong.
<h4>Solution</h4>
Manually decide for one of the relations. If a component relation is chosen and the supercount is only 1, a new superclass needs to be specified.
<br/>
<input type="button" id="sgvizler-button-subclassof-component" value="List Class pairs connected via both superclass and component relations" />
<div id="sgvizler-div-subclassof-component"
         data-sgvizler-query="
select ?sub ?super COUNT(DISTINCT(?duper)) as ?supercount
FROM <http://www.snik.eu/ontology>
{
 owl:Class ^a ?sub,?super.
 ?sub rdfs:subClassOf ?super.
 ?sub rdfs:subClassOf ?duper.
 ?sub meta:roleComponent|meta:functionComponent|meta:entityTypeComponent|^meta:roleComponent|^meta:functionComponent|^meta:entityTypeComponent ?super.
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
FROM <http://www.snik.eu/ontology>
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
Classes are sets of individuals and can be subclasses (subsets) of other classes.
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
FROM <http://www.snik.eu/ontology>
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
FROM <http://www.snik.eu/ontology>
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
FROM <http://www.snik.eu/ontology>
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
The offending triples should be removed or remodelled to conform to the domain.
<br/>
<input type="button" id="sgvizler-button-domain" value="List Domain Violations" />
<div id="sgvizler-div-domain"
         data-sgvizler-query="
select *
FROM <http://www.snik.eu/ontology>
{
 ?p rdfs:domain ?domain.
 filter(?domain!=meta:Top) 
 ?s ?p ?o.                                                                                                                                                                                                         
 minus {?s a|rdfs:subClassOf*|meta:subTopClass ?domain.}
} order by ?p ?s
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
select *
FROM <http://www.snik.eu/ontology>                                                                                                                                                                                 
{
 ?p rdfs:range ?range.
 filter(!strstarts(str(?range),'http://www.w3.org/2001/XMLSchema#'))
 ?s ?p ?o.
 minus {?o a?/rdfs:subClassOf*|meta:subTopClass ?range.}
} order by ?p ?s
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
FROM <http://www.snik.eu/ontology>
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
FROM <http://www.snik.eu/ontology>
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
FROM <http://www.snik.eu/ontology>
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

<h3>Non-HTTP URI</h3>
<div>
<h4>Situation</h4>
Our URIs begin with http://...
<h4>Problem</h4>
Tools like the OntoWiki sometimes fail to expand a prefix and thus create URIs that have an incorrect prefix.
<h4>Solution</h4>
List all triples with URIs that are neither HTTP URIs nor blanknodes.
<br/>
<input type="button" id="sgvizler-button-non-http" value="List Non-HTTP URIs" />
<div id="sgvizler-div-non-http"
         data-sgvizler-query="
select ?x
FROM <http://www.snik.eu/ontology>
{
{?x ?p ?o.} UNION {?s ?x ?o}. filter(!regex(str(?x),'http://')&&!regex(str(?x),'nodeID')).
}
">
</div>
</div>


<h3>OWL 2 DL: Undefined Properties</h3>
<div>
<h4>Situation</h4>
Some URIs are used in the property position of a triple but are neither declared as owl:ObjectProperty, nor as owl:DataTypeProperty.
<h4>Problem</h4>
This violates the <a href="https://www.w3.org/TR/owl2-syntax/#Typing_Constraints_of_OWL_2_DL">typing constraints of OWL 2 DL</a>.
<h4>Solution</h4>
List all URIs are used in the property position of a triple but are neither declared as owl:ObjectProperty, nor as owl:DataTypeProperty.
Exclude those defined in vocabularies like RDF, RDFS, OWL and so on.
<br/>
<input type="button" id="sgvizler-button-undefined-property" value="Undefined Properties" />
<div id="sgvizler-div-undefined-property"
         data-sgvizler-query="
select distinct(?p) from <http://www.snik.eu/ontology>
{
 ?x ?p ?y.
 filter(!(strstarts(str(?p),'http://www.w3.org/1999/02/22-rdf-syntax-ns#')))
 filter(!(strstarts(str(?p),'http://www.w3.org/2000/01/rdf-schema#')))
 filter(!(strstarts(str(?p),'http://www.w3.org/2002/07/owl#')))
 filter(!(strstarts(str(?p),'http://purl.org/dc/terms/')))
 filter(!(strstarts(str(?p),'http://purl.org/ontology/bibo/')))
 filter(!(strstarts(str(?p),'http://purl.org/vocab/vann/')))
 filter(!(strstarts(str(?p),'http://open.vocab.org/terms/')))
 filter(!(strstarts(str(?p),'http://schema.org/')))
 filter(!(strstarts(str(?p),'http://www.w3.org/2004/02/skos/core#')))
 filter(!(strstarts(str(?p),'http://xmlns.com/foaf/0.1/')))
 filter(!(strstarts(str(?p),'http://rdfs.org/sioc/ns#')))

 MINUS {?p a owl:DatatypeProperty. filter(!isIRI(?y))}
 MINUS {?p a owl:ObjectProperty. filter(isIRI(?y))}
} order by ?p
">
</div>
</div>

<h3>OWL 2 DL: Multiply Defined Properties</h3>
<div>
<h4>Situation</h4>
Some URIs may be defined as more than one of owl:ObjectProperty, owl:DatatypeProperty and owl:AnnotationProperty.
<h4>Problem</h4>
This violates the <a href="https://www.w3.org/TR/owl2-syntax/#Typing_Constraints_of_OWL_2_DL">typing constraints of OWL 2 DL</a>.
<h4>Solution</h4>
List all URIs that are defined as more than one of owl:ObjectProperty, owl:DatatypeProperty and owl:AnnotationProperty.
<br/>
<input type="button" id="sgvizler-button-multi-property" value="Multiply Defined Properties" />
<div id="sgvizler-div-multi-property"
         data-sgvizler-query="
select distinct(?x) from <http://www.snik.eu/ontology>
{
 {?x a owl:DatatypeProperty,owl:ObjectProperty.} UNION
 {?x a owl:ObjectProperty,owl:AnnotationProperty.} UNION
 {?x a owl:AnnotationProperty,owl:DatatypeProperty.}
}
">
</div>
</div>

<h3>OWL 2 DL: Class Typing Constraints</h3>
<div>
<h4>Situation</h4>
Some URIs may be used in axioms without being defined as an owl:Class.
<h4>Problem</h4>
This violates the <a href="https://www.w3.org/TR/owl2-syntax/#Typing_Constraints_of_OWL_2_DL">typing constraints of OWL 2 DL</a>.
<h4>Solution</h4>
List all URIs that occur in axioms but that aren't defined as an owl:Class.
<br/>
<input type="button" id="sgvizler-button-class-typing" value="Class Typing Violations" />
<div id="sgvizler-div-class-typing"
         data-sgvizler-query="
select distinct(?cl)
{
 ?ax a owl:Axiom.
 ?ax ?p ?cl.
 filter(isIRI(?cl)).
 filter(strStarts(str(?cl),'http://www.snik.eu/ontology/')).
 MINUS
 {
  ?cl a owl:Class.
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
