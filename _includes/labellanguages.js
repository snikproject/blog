function languageQuery(graph)
{
  return `select ?lang count(?class) as ?count
	from <${graph}>
	{
		{?class a meta:EntityType.} UNION {?class a meta:Role.} UNION {?class a meta:Function.} UNION {?class a owl:Class.}
		{
			select ('both' as ?lang) ?class
			{
				?class rdfs:label ?label1, ?label2.
				filter((lang(?label1)='en') AND (lang(?label2)='de'))
			}
		}
		UNION
		{
			select ('de' as ?lang) ?class
			{
				?class rdfs:label ?label.
				filter(lang(?label)='de').
				filter not exists
        {
          ?class a owl:Class; rdfs:label ?label2.
          filter(lang(?label2)='en').
        }
      }
		}
		UNION
		{
			select ('en' as ?lang) ?class
			{
				?class rdfs:label ?label.
				filter(lang(?label)='en').
				filter not exists
				{
					?class a owl:Class; rdfs:label ?label2.
					filter(lang(?label2)='de').
				}
			}
		}
		UNION
		{
			select ('neither' as ?lang) ?class
			{
				filter not exists
				{
					?class rdfs:label ?label.
					filter(lang(?label)='de').
				}
				filter not exists
				{
					?class rdfs:label ?label.
					filter(lang(?label)='en').
				}
			}
		}
	} order by asc(?lang)`
}

function diagramFragment()
{
  var frag = document.createDocumentFragment();
  var div = frag.appendChild(document.createElement("div"));
  div.style = "display:flex;";
  const prefixes = ["meta","bb","ob","he"];
  for(var i in prefixes)
  {
    var prefix = prefixes[i];
    //console.log(languageQuery('http://www.snik.eu/ontology/'+prefix));
    div.innerHTML +=
      `<span><h3>${prefix}</h3>
      <div
      id="${prefix}"
      data-sgvizler-endpoint="https://www.snik.eu/sparql"
      data-sgvizler-query="${languageQuery('http://www.snik.eu/ontology/'+prefix)}"
      data-sgvizler-chart="google.visualization.PieChart"
      style="width:400px;height:400px;"></div></span>`
  }
  return frag;
}
