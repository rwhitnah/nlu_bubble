(function() {
  var Bubbles, drawBubbles, drawSentiments, root, texts;

  var active = false;
  var json = {};
  root = typeof exports !== "undefined" && exports !== null ? exports : this;



  Bubbles = function() {
    var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
    width = 980;
    height = 510;
    data = [];
    node = null;
    label = null;
    margin = {
      top: 5,
      right: 0,
      bottom: 0,
      left: 0
    };
    maxRadius = 45;
    rScale = d3.scale.sqrt().range([0, maxRadius]);
    rValue = function(d) {
      var num;
      num = d.relevance * 10;
      num = Math.pow(num, 2);
      num = num.toFixed(0);
      return num;
    };
    idValue = function(d) {
      return d.text.substring(0, 24);
    };
    textValue = function(d) {
      return d.text.substring(0, 24);
    };
    collisionPadding = 4;
    minCollisionRadius = 12;
    jitter = 0.8;
    transformData = function(rawData) {
      if (rawData.length > 0) {
        rawData.forEach(function(d) {
          return rawData.sort(function() {
            return 0.5 - Math.random();
          });
        });
      }
      return rawData;
    };
    tick = function(e) {
      var dampenedAlpha;
      dampenedAlpha = e.alpha * 0.1;
      node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
      return label.style("left", function(d) {
        return ((margin.left + d.x) - d.dx / 2) + "px";
      }).style("top", function(d) {
        return ((margin.top + d.y) - d.dy / 2) + "px";
      });
    };
    force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
    chart = function(selection) {
      return selection.each(function(rawData) {
        var maxDomainValue, svg, svgEnter;
        data = transformData(rawData);
        maxDomainValue = d3.max(data, function(d) {
          return rValue(d);
        });
        rScale.domain([0, maxDomainValue]);
        svg = d3.select(this).selectAll("svg").data([data]);
        svg.remove();
        svg = d3.select(this).selectAll("svg").data([data]);
        svgEnter = svg.enter().append("svg");
        svg.attr("width", width + margin.left + margin.right);
        svg.attr("height", height + margin.top + margin.bottom);
        node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
        label = d3.select(this).selectAll("#bubble-labels").data([data]);
        label.remove();
        label = d3.select(this).selectAll("#bubble-labels").data([data]);
        label.enter().append("div").attr("id", "bubble-labels");
        update();
        hashchange();
        return d3.select(window).on("hashchange", hashchange);
      });
    };
    update = function() {
      if (data.length > 0) {
        data.forEach(function(d, i) {
          return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
        });
      }
      force.nodes(data).start();
      updateNodes();
      return updateLabels();
    };
    updateNodes = function() {
      node = node.selectAll(".bubble-node").data(data, function(d) {
        return idValue(d);
      });
      node.exit().remove();
      return node.enter().append("a").attr("class", "bubble-node").attr("xlink:href", function(d) {
        return "#" + (encodeURIComponent(idValue(d)));
      }).call(force.drag).call(connectEvents).append("circle").attr("r", function(d) {
        return rScale(rValue(d));
      });
    };
    updateLabels = function() {
      var labelEnter;
      label = label.selectAll(".bubble-label").data(data, function(d) {
        return idValue(d);
      });
      label.exit().remove();
      labelEnter = label.enter().append("a").attr("class", "bubble-label").attr("href", function(d) {
        return "#" + (encodeURIComponent(idValue(d)));
      }).call(force.drag).call(connectEvents);
      labelEnter.append("div").attr("class", "bubble-label-name").text(function(d) {
        return textValue(d);
      });
      labelEnter.append("div").attr("class", "bubble-label-value").text(function(d) {
        return rValue(d);
      });
      label.style("font-size", function(d) {
        return Math.max(8, rScale(rValue(d) / 6)) + "px";
      }).style("width", function(d) {
        return 1.5 * rScale(rValue(d)) + "px";
      });
      label.append("span").text(function(d) {
        return textValue(d);
      }).each(function(d) {
        return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
      }).remove();
      label.style("width", function(d) {
        return d.dx + "px";
      });
      return label.each(function(d) {
        return d.dy = this.getBoundingClientRect().height;
      });
    };
    gravity = function(alpha) {
      var ax, ay, cx, cy;
      cx = width / 2;
      cy = height / 2;
      ax = alpha / 8;
      ay = alpha;
      return function(d) {
        d.x += (cx - d.x) * ax;
        return d.y += (cy - d.y) * ay;
      };
    };
    collide = function(jitter) {
      return function(d) {
        return data.forEach(function(d2) {
          var distance, minDistance, moveX, moveY, x, y;
          if (d !== d2) {
            x = d.x - d2.x;
            y = d.y - d2.y;
            distance = Math.sqrt(x * x + y * y);
            minDistance = d.forceR + d2.forceR + collisionPadding;
            if (distance < minDistance) {
              distance = (distance - minDistance) / distance * jitter;
              moveX = x * distance;
              moveY = y * distance;
              d.x -= moveX;
              d.y -= moveY;
              d2.x += moveX;
              return d2.y += moveY;
            }
          }
        });
      };
    };
    connectEvents = function(d) {
      d.on("click", click);
      d.on("mouseover", mouseover);
      return d.on("mouseout", mouseout);
    };
    clear = function() {
      return location.replace("#");
    };
    click = function(d) {
      location.replace("#" + encodeURIComponent(idValue(d)));
      return d3.event.preventDefault();
    };
    hashchange = function() {
      var id;
      id = decodeURIComponent(location.hash.substring(1)).trim();
      return updateActive(id);
    };
    updateActive = function(id) {
      node.classed("bubble-selected", function(d) {
        return id === idValue(d);
      });
      if (id.length > 0) {
        return d3.select("#status").html("<h3>The word <span class=\"active\">" + id + "</span> is now active</h3>");
      } else {
        return d3.select("#status").html("<h3>No word is active</h3>");
      }
    };
    mouseover = function(d) {
      return node.classed("bubble-hover", function(p) {
        return p === d;
      });
    };
    mouseout = function(d) {
      return node.classed("bubble-hover", false);
    };
    chart.jitter = function(_) {
      if (!arguments.length) {
        return jitter;
      }
      jitter = _;
      force.start();
      return chart;
    };
    chart.height = function(_) {
      if (!arguments.length) {
        return height;
      }
      height = _;
      return chart;
    };
    chart.width = function(_) {
      if (!arguments.length) {
        return width;
      }
      width = _;
      return chart;
    };
    chart.r = function(_) {
      if (!arguments.length) {
        return rValue;
      }
      rValue = _;
      return chart;
    };
    return chart;
  };

  root.plotData = function(selector, data, plot) {
    return d3.select(selector).datum(data).call(plot);
  };

  texts = [
    {
      key: "aesop",
      file: "top_aesop.csv",
      name: "Aesop's Fables"
    }
  ];

  drawBubbles = function(tabType) {
    var display, key, plot, text;
    plot = Bubbles();
    display = function(data) {
      var dataObj;
      dataObj = json;
      if (tabType === "#keywordsTab") {
        plotData("#vis", dataObj.keywords, plot);
      }
      if (tabType === "#conceptsTab") {
        plotData("#vis", dataObj.concepts, plot);
      }
      if (tabType === "#entitiesTab") {
        plotData("#vis", dataObj.entities, plot);
      }
      if (tabType === "#sentimentsTab") {
        return plotData("#vis", dataObj.sentiment.document, plot);
      }
    };
    key = decodeURIComponent(location.search).replace("?", "");
    text = texts.filter(function(t) {
      return t.key === key;
    })[0];
    if (!text) {
      text = texts[0];
    }
    $("#text-select").val(key);
    d3.select("#jitter").on("input", function() {
      return plot.jitter(parseFloat(this.output.value));
    });
    d3.select("#text-select").on("change", function(e) {
      key = $(this).val();
      location.replace("#");
      return location.search = encodeURIComponent(key);
    });

    return d3.csv("data/" + text.file, display);
  };

  drawSentiments = function() {
    var rectangle1, rectangle2, rectangle3, rectangle4, rectangle5, rectangle6, rectangle7, svgContainer, text1, text2, text3, text4, text5, text6, text7;
    svgContainer = d3.select("#vis").append("svg").attr("width", 200).attr("height", 200);
    rectangle1 = svgContainer.append("rect").attr("x", 150).attr("y", 60).attr("width", json.emotion.document.emotion.joy * 200).attr("height", 20).style("fill", "#00C851");
    text1 = svgContainer.append("text").attr("x", 100).attr("y", 75).text("Joy").attr("font-family", "georgia").attr("font-size", "14px").attr("fill", "black");
    rectangle2 = svgContainer.append("rect").attr("x", 150).attr("y", 100).attr("width", json.emotion.document.emotion.anger * 200).attr("height", 20).style("fill", "#ff4444");
    text2 = svgContainer.append("text").attr("x", 100).attr("y", 115).text("Anger").attr("font-family", "georgia").attr("font-size", "14px").attr("fill", "black");
    rectangle3 = svgContainer.append("rect").attr("x", 150).attr("y", 140).attr("width", json.emotion.document.emotion.sadness * 200).attr("height", 20).style("fill", "#4B515D");
    text3 = svgContainer.append("text").attr("x", 100).attr("y", 155).text("Sad").attr("font-family", "georgia").attr("font-size", "14px").attr("fill", "black");
    rectangle4 = svgContainer.append("rect").attr("x", 150).attr("y", 180).attr("width", json.emotion.document.emotion.disgust * 200).attr("height", 20).style("fill", "#33b5e5");
    text4 = svgContainer.append("text").attr("x", 100).attr("y", 195).text("Disgust").attr("font-family", "georgia").attr("font-size", "14px").attr("fill", "black");
    rectangle5 = svgContainer.append("rect").attr("x", 150).attr("y", 220).attr("width", json.emotion.document.emotion.fear * 200).attr("height", 20).style("fill", "#ffbb33");
    text5 = svgContainer.append("text").attr("x", 100).attr("y", 235).text("Fear").attr("font-family", "georgia").attr("font-size", "14px").attr("fill", "black");
    if (json.sentiment.document.score*100 > 0) {
      rectangle6 = svgContainer.append("rect").attr("x", 150).attr("y", 260).attr("width", json.sentiment.document.score * 200).attr("height", 20).style("fill", "#DCE9BE");
      text6 = svgContainer.append("text").attr("x", 37).attr("y", 275).text("Overall (Positive)").attr("font-family", "georgia").attr("font-size", "14px").attr("fill", "black");
    }
    if (json.sentiment.document.score*100 < 0) {
      rectangle7 = svgContainer.append("rect").attr("x", 150).attr("y", 260).attr("width", json.sentiment.document.score * -200).attr("height", 20).style("fill", "#f06292");
      text7 = svgContainer.append("text").attr("x", 37).attr("y", 275).text("Overall (Negative)").attr("font-family", "georgia").attr("font-size", "14px").attr("fill", "black");
    }
  };

  $(function() {
    $("#conceptsTab").click(function() {
      if(active) {
        $("#entitiesLi").removeClass('active');
        $("#sentimentsLi").removeClass('active');
        $("#keywordsLi").removeClass('active');
        $("#conceptsLi").addClass('active');
        return drawBubbles("#conceptsTab");
      }
    });
    $("#keywordsTab").click(function() {
      if (active) {
        $("#conceptsLi").removeClass('active');
        $("#entitiesLi").removeClass('active');
        $("#sentimentsLi").removeClass('active');
        $("#keywordsLi").addClass('active');
        return drawBubbles("#keywordsTab");
      }
    });
    $("#entitiesTab").click(function() {
      if (active) {
        $("#conceptsLi").removeClass('active');
        $("#sentimentsLi").removeClass('active');
        $("#keywordsLi").removeClass('active');
        $("#entitiesLi").addClass('active');
        return drawBubbles("#entitiesTab");
      }
    });
    $("#sentimentsTab").click(function() {
      if(active) {
        $("#entitiesLi").removeClass('active');
        $("#conceptsLi").removeClass('active');
        $("#keywordsLi").removeClass('active');
        $("#sentimentsLi").addClass('active');
        drawBubbles("#sentimentsTab");
        return drawSentiments();
      }
    });
  });

  $(function() {
    $("#upload-form").submit(function( event ) {
      event.preventDefault();
      
      var formData = new FormData();
      formData.append('file', $('#file')[0].files[0]);

      $.ajax({
        url : '/fileUpload',
        type : 'POST',
        data : formData,
        processData: false,
        contentType: false,
        success : function(data) {
          console.log(data);
          json = data;
          active = true;
          drawBubbles("#conceptsTab");
        }
      });
    });
  });

}).call(this);
