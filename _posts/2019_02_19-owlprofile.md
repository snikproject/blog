---
layout: post
use_math: true 
title: What is the OWL profile of SNIK? (Draft)
tags: [snik, ontology, owl, complexity]
date: 2017-01-13
---

# Abstract
We compared the statements of SNIK against the restrictions of the different OWL and OWL 2 profiles.

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

1. We have ontology URIs for each of the meta model and all the subontologies. The central statment here is "IRIs from the reserved vocabulary MUST NOT be used as an ontology IRI or a version IRI of an OWL 2 DL ontology." which is no problem for us, because our ontology URIs are of the form http://www.snik.eu/{meta,ob,bb,ciox,...}.

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

2.

### Protégé OWL 2 Profile Checker

# Sources and Further Information

* [OWL 2 Profiles: An Introduction to Lightweight Ontology Languages by Markus Krötzsch](https://www.youtube.com/watch?v=ybfidE6zhts)


