var allGames = {
  "hfov": {
    "hFov": {
      decimals: 0,
      factor: 1
    },
    "Project CARS 1/2": {
      min: 35,
      max: 180,
      decimals: 0,
      factor: 1
    },
    "European & American Truck Simulator": {
      min: 35,
      max: 180,
      decimals: 0,
      factor: 1
    }
  },
  "hfovrad": {
    "Richard Burns Rally": {
      min: 10,
      max: 180,
      decimals: 6,
      factor: 1
    }
  },
  "hfov_base_step": {
    "F1 2016/2017/+": { // https://www.reddit.com/r/F1Game/comments/7x0of9/codemasters_f1_20162017_fov_slider/
      min: -1,
      max: +1,
      decimals: 2,
      factor: 1,
      base: 77, // Base values for other cameras: T-Cam + Nose: 82, T-Cam with offset: 85
      increment: 2,
      step: 0.05, // slider step
    }
  },
  "vfov" : {
    "vFov": {
      decimals: 0,
      factor: 1
    },
    "Assetto Corsa, Assetto Corsa Competizione": {
      min: 10,
      max: 120,
      decimals: 1,
      factor: 1
    },
    "rFactor 1 & 2, GSC, GSCE, SCE, AMS (ISI Engine)": {
      min: 10,
      max: 100,
      decimals: 0,
      factor: 1
    },
    "DiRT Rally 1/2, GRID Autosport": {
      min: 10,
      max: 115,
      decimals: 0,
      factor: 2
    }
  },
  "vfovx": {
    "RaceRoom Racing Experience" : {
      min: 0.5,
      max: 1.5,
      decimals: 1,
      factor: 1,
      baseSingle: 58,
      baseTriple: 40
    },
    "GTR2" : {
      min: 0.5,
      max: 1.5,
      decimals: 1,
      factor: 1,
      baseSingle: 58,
      baseTriple: 58
    },
    "Race07" : {
      min: 0.4,
      max: 1.5,
      decimals: 1,
      factor: 1,
      baseSingle: 58,
      baseTriple: 58
    }
  }
};

$(document).ready(function() {
  document.getElementById("monitor_width").value = restoreValue("monitor_width");
  document.getElementById("monitor_height").value = restoreValue("monitor_height");
  document.getElementById("bezel_side").value = restoreValue("bezel_side");
  document.getElementById("bezel_top").value = restoreValue("bezel_top");
  document.getElementById("bezel_bottom").value = restoreValue("bezel_bottom");
  document.getElementById("curvature").value = restoreValue("curvature");
  document.getElementById("distance").value = restoreValue("distance");
});

function saveValue(element) {
  var key = element.id;
  var val = element.value;
  localStorage.setItem(key, val);
}

function restoreValue(key) {
  if (!localStorage.getItem(key)) {
    return "";
  }
  return localStorage.getItem(key);
}

function calculateFOV() {

  var monitorWidth = parseFloat($("#monitor_width").val());
  var monitorHeight = parseFloat($("#monitor_height").val());
  var bezelSide = parseFloat($("#bezel_side").val());
  var bezelTop = parseFloat($("#bezel_top").val());
  var bezelBottom = parseFloat($("#bezel_bottom").val());
  var curvature = parseFloat($("#curvature").val());
  var distance = parseFloat($("#distance").val());

  var outterAngle = 2 * (Math.asin(monitorWidth / 2 / curvature));
  var outterArcLength = curvature * outterAngle;
  var innerArcLength = outterArcLength - 2 * bezelSide;
  var innerAngle = innerArcLength / curvature;

  // actual screen dimensions without the bezels
  var screenWidth = 2 * Math.sin(innerAngle / 2) * curvature;
  var screenHeight = monitorHeight - bezelTop - bezelBottom;

  // distance from the surface that connects the two sides of the screen to
  // the actual surface of the screen
  var arcDistance = curvature - (1 / Math.tan(innerAngle / 2)) * (screenWidth / 2);

  // distance to the screen as if the screen is flat
  // i.e. distance from eye to the surface that connects the two sides of the screen
  // or imagine your curved monitor is part of a circle (which it is), the flat surface
  // here is the chord that connects either side of the screen.
  var flatDistance = distance - arcDistance;

  var arcConstant = 180 / Math.PI;

  var hFOVRad = Math.atan(screenWidth / 2 / flatDistance) * 2;
  var hFOVDegree = hFOVRad * arcConstant;

  var hFOVUnfoldedRad = Math.atan(innerArcLength / 2 / distance) * 2;
  var hFOVUnfoldedDegree = hFOVUnfoldedRad * arcConstant;

  var vFOVRad = Math.atan(screenHeight / 2 / flatDistance) * 2;
  var vFOVDegree = vFOVRad * arcConstant;

  var vFOVUnfoldedRad = Math.atan(screenHeight / 2 / distance) * 2;
  var vFOVUnfoldedDegree = vFOVUnfoldedRad * arcConstant;

  var html = "<ul>";

  for (var calcGroup in allGames) {
    for (var gameName in allGames[calcGroup]) {

      var game = allGames[calcGroup][gameName];

      // Calculate game.
      var value = "";
      var valueUnfolded = "";
      var unit = "";
      if (calcGroup == "hfov" || calcGroup == "hfov_base_step") {
        value = hFOVDegree;
        valueUnfolded = hFOVUnfoldedDegree;
        unit = "°";
      } else if (calcGroup == "vfov" || calcGroup == "vfovx") {
        value = vFOVDegree;
        valueUnfolded = vFOVUnfoldedDegree;
        unit = "°";
      } else if (calcGroup == "hfovrad") {
        value = calcAngle(screenHeight * 4 / 3, flatDistance);
        valueUnfolded = calcAngle(screenHeight * 4 / 3, distance);
        unit = "rad";
      }

      // Factor.
      value *= game.factor;
      valueUnfolded *= game.factor;

      // Further calculations.
      if (calcGroup == "vfovx") {
        value /= game.baseSingle;
        valueUnfolded /= game.baseSingle;
        unit = "x";
      }

      if (calcGroup == "hfov_base_step") {
        // ((target - base) / increemnt) * step
        value = Math.round((value - game.base) / game.increment) * game.step;
        valueUnfolded = Math.round((valueUnfolded - game.base) / game.increment) * game.step;
        unit = "";
      }

      // Check min/max.
      value = game.min ? Math.max(value, game.min) : value;
      value = game.max ? Math.min(value, game.max) : value;
      valueUnfolded = game.min ? Math.max(valueUnfolded, game.min) : valueUnfolded;
      valueUnfolded = game.max ? Math.min(valueUnfolded, game.max) : valueUnfolded;

      // Final calculations.
      if (calcGroup.indexOf("hfovrad") != -1) {
        value *= (Math.PI / 180);
        valueUnfolded *= (Math.PI / 180);
      }

      // Output.
      var base = Math.pow(10, game.decimals);
      html += "<li>";
      html += "<span>" + gameName + "</span>";
      html += "<span>" +
              (Math.round(value * base) / base).toFixed(game.decimals) + " ~ " +
              (Math.round(valueUnfolded * base) / base).toFixed(game.decimals) + unit + "</span></li>";
      html += "</li>";
    }
  }

  html += "</ul>";

  $("#fov").html(html);
}

function calcAngle(base, distance) {
  return (180 / Math.PI) * Math.atan(base / 2 / distance) * 2;
}
