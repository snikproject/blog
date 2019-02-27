---
layout: post
title: What is the OWL profile of SNIK?
use_math: false 
tags: [snik, ontology, owl, complexity]
date: 2019-02-21
---

# Abstract
We compared the statements of SNIK against the restrictions of the different OWL and OWL 2 profiles to find out of it conforms to one of them and found out it conforms to at least OWL 2 DL barring a few errors.

# Problem
The planned continuation of the SNIK project contains a reasoner module, mostly to check ontology consistency and class consistency.
Depending on the type of statments used, ontology reasoning can have a vastly different complexity, from polynomial (OWL 2 EL) to undecidable (OWL 2 full). 
 
# OWL Profile Analysis

## OWL 2 Full
Reasoning on OWL 2 Full is undecidable and places no restriction whatsoever.

## OWL 2 DL under Direct Semantics
Reasoning in OWL 2 DL is decidable but only in double exponential time, not very helpful to us.
An OWL 2 ontology O must satisfy the following conditions to be an OWL 2 DL ontology, see the [W3C OWL 2 Syntax](https://www.w3.org/TR/owl2-syntax/#Ontologies):

### Requirements
1. The ontology IRI and the version IRI (if present) of O MUST satisfy the restrictions on usage of the reserved vocabulary from [Section 3.1](https://www.w3.org/TR/owl2-syntax/#Ontology_IRI_and_Version_IRI).
2. Each datatype and each literal in O MUST satisfy the restrictions from Section 5.2 and Section 5.7, respectively.
3. Each entity in O MUST have an IRI satisfying the restrictions on the usage of the reserved vocabulary from Sections 5.1–5.6.
4. O MUST satisfy the typing constraints from Section 5.8.1.
5. Each DatatypeRestriction in O MUST satisfy the restriction on the usage of constraining facets from Section 7.5, respectively.
6. O MUST satisfy the global restriction from Section 11.
7. Each O' directly imported into O MUST satisfy all of these restrictions as well. 

### Analysis

#### 1. Reserved Vocabulary
We have ontology URIs for each of the meta model and all the subontologies. The central statment here is "IRIs from the reserved vocabulary MUST NOT be used as an ontology IRI or a version IRI of an OWL 2 DL ontology." which is no problem for us, because our ontology URIs are of the form http://www.snik.eu/{meta,ob,bb,ciox,...}.

The reserved vocabulary is:

```
owl:backwardCompatibleWith 	owl:bottomDataProperty 	owl:bottomObjectProperty 	owl:deprecated 	owl:incompatibleWith
owl:Nothing 	owl:priorVersion 	owl:rational 	owl:real 	owl:versionInfo
owl:Thing 	owl:topDataProperty 	owl:topObjectProperty 	rdf:langRange 	rdf:PlainLiteral
rdf:XMLLiteral 	rdfs:comment 	rdfs:isDefinedBy 	rdfs:label 	rdfs:Literal
rdfs:seeAlso 	xsd:anyURI 	xsd:base64Binary 	xsd:boolean 	xsd:byte
xsd:dateTime 	xsd:dateTimeStamp 	xsd:decimal 	xsd:double 	xsd:float
xsd:hexBinary 	xsd:int 	xsd:integer 	xsd:language 	xsd:length
xsd:long 	xsd:maxExclusive 	xsd:maxInclusive 	xsd:maxLength 	xsd:minExclusive
xsd:minInclusive 	xsd:minLength 	xsd:Name 	xsd:NCName 	xsd:negativeInteger
xsd:NMTOKEN 	xsd:nonNegativeInteger 	xsd:nonPositiveInteger 	xsd:normalizedString 	xsd:pattern
xsd:positiveInteger 	xsd:short 	xsd:string 	xsd:token 	xsd:unsignedByte
xsd:unsignedInt 	xsd:unsignedLong 	xsd:unsignedShort 	
```

#### 2. Datatype and Literal Restrictions
##### 2.1 Datatype Restrictions 
SNIK conforms to the [restrictions on datatypes from section 5.2](https://www.w3.org/TR/owl2-syntax/#Datatypes) because we just use existing datatypes from the XML schema:

**SPARQL Query**

```
select distinct datatype(?z) count(*) from <http://www.snik.eu/ontology>
{
  ?x ?y ?z.
  filter (datatype(?z) != '')
} group by datatype(?z)
```

**Result**

```
| callret-0                                           | callret-1 |
|-----------------------------------------------------|-----------|
| http://www.w3.org/2001/XMLSchema#string             | 11650     |
| http://www.w3.org/2001/XMLSchema#nonNegativeInteger | 4         |
| http://www.w3.org/2001/XMLSchema#integer            | 7237      |
| http://www.w3.org/2001/XMLSchema#dateTime           | 1         |
| http://www.w3.org/2001/XMLSchema#positiveInteger    | 2130      |
| http://www.w3.org/2001/XMLSchema#date               | 6         |
| http://www.w3.org/2001/XMLSchema#boolean            | 2052      |
```

##### 2.2 Literal Restrictions 

The key part of [Section 5.7 on Literals](https://www.w3.org/TR/owl2-syntax/#Literals) seems to be:
"The lexical form of each literal occurring in an OWL 2 DL ontology MUST belong to the lexical space of the literal's datatype. [...] Example: "1"^^xsd:integer is a literal that represents the integer 1."

We don't need to check xsd:string literals as every string should be a valid xsd:string.
However, checking all the other datatypes is getting a bit tedious, so we try to find existing tools for the job.

[Validata: RDF Validator using Shape Expressions](https://www.w3.org/2015/03/ShExValidata/): I don't know how ShEx expressions work but I tried the schema and data checks, which both accept `:x :y "x"^^xsd:integer`, so I didn't look further into Validata. 

So I created a [Stack Overflow post](https://stackoverflow.com/questions/54807315/how-to-validate-rdf-literals-using-sparql) which got the answers that validation is implementation specific and not completely done by Virtuoso, so I created this SPARQL query:

```
select *
{
?s ?p ?o.
filter(!isIRI(?o)).
bind(datatype(?o) as ?type)


filter
(

(?type=xsd:boolean&&xsd:boolean(?o)!=?o)

|| (?type=xsd:date&&xsd:date(?o)!=?o)

|| (?type=xsd:integer&&xsd:int(?o)!=?o)

|| ((?type=xsd:positiveInteger) && (xsd:int(?o)!=?o||xsd:int(?o)<1))

|| ((?type=xsd:nonNegativeInteger) && (xsd:int(?o)!=?o||xsd:int(?o)<0))

)

}
```

Which is tested with this Turtle file:

```
@base <> .
@prefix :<>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

# wrong

:x :y "kind of?"^^xsd:boolean.

:x :y "whenever"^^xsd:date.
:x :y "2000-01-01"^^xsd:dateTime.
:x :y "2000-01-01-06:00"^^xsd:date.

:x :y "01012000"^^xsd:date.

:x :y "x"^^xsd:integer.
:x :y "-1"^^xsd:nonNegativeInteger.
:x :y "0"^^xsd:positiveInteger.

# correct

:x :y "2000-01-01"^^xsd:date.
:x :y "2000-01-01-06:00"^^xsd:dateTime.

:x :y "true"^^xsd:boolean.
:x :y "false"^^xsd:boolean.

:x :y "-5"^^xsd:integer.
:x :y "0"^^xsd:nonNegativeInteger.
:x :y "1"^^xsd:positiveInteger.                                                                                                                                                                                    
```

Which gets detected correctly except for the datetime-date switch.

Running this query on the SNIK graph group `<http://www.snik.eu/ontology>` returns no results, so the literals seem to be OK.

#### 3. IRI Restrictions
"Each entity in O MUST have an IRI satisfying the restrictions on the usage of the reserved vocabulary from Sections [5.1](https://www.w3.org/TR/owl2-syntax/#Classes)–5.6."

We don't use any reserved vocabulary IRIs, so we should be able to skip this.

#### 4. Typing Constraints

##### 4.1 Property typing constraints:
I interpret this to include imported vocabularies like rdf and rdfs, because otherwise we couldn't use rdf:type and other object properties.

For our own properties, this is a great candidate for our quality checker with the following query:
###### Object and Data Properties
* If an object property with an IRI I occurs in some axiom in Ax, then I is declared in Ax as an object property.
* If a data property with an IRI I occurs in some axiom in Ax, then I is declared in Ax as a data property.


```
select distinct(?p) from <http://www.snik.eu/ontology>
{
 ?x ?p ?y.
 filter(!(strstarts(str(?p),"http://www.w3.org/1999/02/22-rdf-syntax-ns#")))
 filter(!(strstarts(str(?p),"http://www.w3.org/2000/01/rdf-schema#")))
 filter(!(strstarts(str(?p),"http://www.w3.org/2002/07/owl#")))
 filter(!(strstarts(str(?p),"http://purl.org/dc/terms/")))
 filter(!(strstarts(str(?p),"http://purl.org/ontology/bibo/")))
 filter(!(strstarts(str(?p),"http://purl.org/vocab/vann/")))
 filter(!(strstarts(str(?p),"http://open.vocab.org/terms/")))
 filter(!(strstarts(str(?p),"http://schema.org/")))
 filter(!(strstarts(str(?p),"http://www.w3.org/2004/02/skos/core#")))
 filter(!(strstarts(str(?p),"http://xmlns.com/foaf/0.1/")))
 filter(!(strstarts(str(?p),"http://rdfs.org/sioc/ns#")))

 MINUS {?p a owl:DataTypeProperty. filter(!isIRI(?y))}
 MINUS {?p a owl:ObjectProperty. filter(isIRI(?y))}
} order by ?p
```

With the following results:

```
http://www.snik.eu/ontology/bb/Chapter
http://www.snik.eu/ontology/bb/ConceptDomain
http://www.snik.eu/ontology/bb/ID
http://www.snik.eu/ontology/bb/TripelPage
http://www.snik.eu/ontology/bb/TripelRowNr
http://www.snik.eu/ontology/bb/page
http://www.snik.eu/ontology/ciox/approves
http://www.snik.eu/ontology/he/chapter
http://www.snik.eu/ontology/he/page
http://www.snik.eu/ontology/it4it/Chapter
http://www.snik.eu/ontology/it4it/MainFunctions
http://www.snik.eu/ontology/it4it/OntologyDomain
http://www.snik.eu/ontology/it4it/OntologyQuestionTypes
http://www.snik.eu/ontology/it4it/OntologyUse
http://www.snik.eu/ontology/it4it/OntologyUser
http://www.snik.eu/ontology/it4it/Purpose
http://www.snik.eu/ontology/it4it/page
http://www.snik.eu/ontology/meta/DefinitionDEPage
http://www.snik.eu/ontology/meta/associatedWith
http://www.snik.eu/ontology/meta/consolidated
http://www.snik.eu/ontology/meta/isDecomposed
http://www.snik.eu/ontology/meta/isMasterFor
http://www.snik.eu/ontology/meta/isResponsibleForRole
http://www.snik.eu/ontology/meta/subClassOf
http://www.snik.eu/ontology/meta/typicalFeature
http://www.snik.eu/ontology/ob/Chapter
http://www.snik.eu/ontology/ob/ConceptDomain
http://www.snik.eu/ontology/ob/ID
http://www.snik.eu/ontology/ob/TripelPage
http://www.snik.eu/ontology/ob/TripelRowNr
http://www.snik.eu/ontology/ob/page
```

However those aren't showstoppers: most of them are wrongly used properties and can either be removed or replaced. For example, meta:subClassOf should be rdfs:subClassOf and meta:associatedWith should be meta:isAssociatedWith.
Others, like meta:consolidated are missing a definition.
The meta information properties like ...:ID, ...:TripelPage and ...:page need to be discussed, whether they should stay in their current form, be remodeled or removed.

###### Annotation Properties
* If an annotation property with an IRI I occurs in some axiom in Ax, then I is declared in Ax as an annotation property.

Annotations and axioms will be reworked, so we investigating those later.

###### Multiply Defined Property
* No IRI I is declared in Ax as being of more than one type of property; that is, no I is declared in Ax to be both object and data, object and annotation, or data and annotation property. 

We add this to the quality checker with the following SPARQL query:

```
select *
{
 {?x a owl:DatatypeProperty,owl:ObjectProperty.} UNION
 {?x a owl:ObjectProperty,owl:AnnotationProperty.} UNION
 {?x a owl:AnnotationProperty,owl:DatatypeProperty.}
}
```

Which has the single result of http://www.snik.eu/ontology/it4it/ID, which belongs to the properties to be reworked anyways.

##### 4.2 Class/datatype typing constraints:

* If a class with an IRI I occurs in some axiom in Ax, then I is declared in Ax as a class.

We add this to the quality checker with the following SPARQL query:

```
select distinct(?cl)
{
 ?ax a owl:Axiom.
 ?ax ?p ?cl.
 filter(isIRI(?cl)).
 filter(strStarts(str(?cl),"http://www.snik.eu/ontology/")).
 MINUS
 {
  ?cl a owl:Class.
 }
}
```

* If a datatype with an IRI I occurs in some axiom in Ax, then I is declared in Ax as a datatype.
* No IRI I is declared in ax to be both a class and a datatype.

We skip the last two, because SNIK does not contain any custom datatypes.

#### 5. DatatypeRestrictions
We don't have any instance of owl:DatatypeRestriction: `select count(distinct(?dr)) {?dr a owl:DatatypeRestriction.}` returns 0.

#### 6. Global Restriction
> O MUST satisfy the global restriction from [Section 11](https://www.w3.org/TR/owl2-syntax/#Global_Restrictions_on_Axioms_in_OWL_2_DL). 

#### 7. Imports
> Each O' directly imported into O MUST satisfy all of these restrictions as well.

The SPARQL query `select * {?x owl:imports ?y.}` shows that we only have two import statements:
```
http://www.snik.eu/ontology/he 	http://www.w3.org/2000/01/rdf-schema#
http://www.snik.eu/ontology/bb 	http://www.w3.org/2000/01/rdf-schema#
```

Besides RDFS we also use, but don't explicitly import, the vocabularies of RDF, OWL, SKOS, XSD, FOAF, VANN, DC, but I assume they are also in OWL 2 DL.

# Conclusion
There are a few errors that prevent SNIK from being in OWL 2 DL, we should prioritize those so that we can use OWL 2 DL reasoners in the follow-up SNIK project.
When this is done and it is deemed necessary by the SNIK reasoner component developers, we will investigate the original question of the OWL 2 profile of SNIK.

# Related Links 

I found those while researching the topic, they may be helpful for further research.

* [RDF Graph Validation Using Rule-Based Reasoning](http://www.semantic-web-journal.net/content/rdf-graph-validation-using-rule-based-reasoning)
* https://www.slideshare.net/jpcik/rdf-data-validation-2017-shacl
* [OWL 2 Profiles: An Introduction to Lightweight Ontology Languages by Markus Krötzsch](https://www.youtube.com/watch?v=ybfidE6zhts)
* [OWL: Yet to arrive on the Web of Data?](http://www.aidanhogan.com/docs/owlld_ldow12.pdf) by Glimm et al..
