var newJSON = '';
var newJSONobj = '';
var JSONData = '';
var myJSONArray = ''
var newJSONtemp = '';
var datesArrNum = [];

/******* FUNCTIONS *******/
// make new JSON structure from website 
function newJSONStructure() {
    // show options buttons
    document.getElementById("options").style.display = "block";

    // Get data from website
    var request = new XMLHttpRequest();

    if (window.XMLHttpRequest) {
        var url = 'https://www.reddit.com/r/funny.json';

        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                JSONData = JSON.parse(request.responseText);
                myJSONArray = JSONData.data.children;  // an array
                newJSONtemp = '';

                // loop through newJSONData and make new JSON structure
                for (var i = 0; i < myJSONArray.length; i++) {
                    datesArrNum[i] = myJSONArray[i].data.created; // get dates in seconds 

                    if (i !== myJSONArray.length - 1) {
                        newJSONtemp += '{"title": "' + myJSONArray[i].data.title + '",'
                            + '"upvotes": ' + myJSONArray[i].data.ups + ','
                            + '"score": ' + myJSONArray[i].data.score + ','
                            + '"num_comments": ' + myJSONArray[i].data.num_comments + ','
                            + '"created": "' + dateFormatter(datesArrNum[i]) + '"'
                            + '},';
                    } else { // if the last one don't put comma in the end
                        newJSONtemp += '{"title": "' + myJSONArray[i].data.title + '",'
                            + '"upvotes": ' + myJSONArray[i].data.ups + ','
                            + '"score": ' + myJSONArray[i].data.score + ','
                            + '"num_comments": ' + myJSONArray[i].data.num_comments + ','
                            + '"created": "' + dateFormatter(datesArrNum[i]) + '"'
                            + '}';
                    }
                }

                // check if there are any double quotes - if yes delete them
                if (newJSONtemp.includes('\"\"')) {
                    newJSONtemp = newJSONtemp.replace(/\"\"/g, "\"");
                }
                newJSON = '{"posts": [' + newJSONtemp + '],"count": ' + myJSONArray.length + '}';

                // make valid JSON  object
                newJSONobj = JSON.parse(newJSON);
                // print JSON object
                document.getElementById("plainText").innerHTML = JSON.stringify(newJSONobj, null, 3);
            }
        };

        request.open("GET", url, true);
        request.send();
    }
}


// Sort by 
function sortBy() {
    // clear div
    clearDiv();

    var resultForm = tempArray(getRadioValue());
    var num = getIndex(resultForm[0], resultForm[1]);

    // print sorted JSON object (only posts)
    for (var i = 0; i < num.length; i++) {
        document.getElementById("plainText").innerHTML += JSON.stringify(newJSONobj.posts[num[i]], null, 3) + '<br>';
    }
}

// Title with the biggest value of upvotes/num_comments
function getTitle() {
    clearDiv();

    var results = arrays();
    var uv = results[0];
    var nc = results[1];
    var uc = [];
    var titles = [];
    var indexArr = [];
    var index = 0;
    var dateTemp = [];

    for (var i = 0; i < uv.length; i++) {
        uc[i] = uv[i] / nc[i];
        titles[i] = JSON.stringify(newJSONobj.posts[i].title);
    }

    var res = getMax(uc); // get max value
    indexArr = res[1]; // res[1] - array of indexes with max

    var temp = arrays();
    var dates = temp[3]; // dates in seconds

    if (indexArr.length > 1) {
        for (var i = 0; indexArr.length; i++) {
            dateTemp.push(dates[i]); // get dates from post with max value
        }
        var res2 = getMax(dateTemp); // get the latest date
        index = res2[1]; // index of the latest post with max value
    } else index = indexArr[0];

    document.getElementById("plainText").innerHTML = 'Title with the biggest value of upvotes/num_comments: <b><i>' + titles[index] + '</b></i>';
}

// get 24h posts only
function only24h() {
    clearDiv();
    var results = arrays();
    is24(results[3]);
}

// Clear div content
function clearDiv() {
    document.getElementById("plainText").innerHTML = '';
}

// format date from seconds to DD.MM.YYYY hh:mm
function dateFormatter(numDate) {
    var dateStr = '';
    var date = new Date(numDate * 1000); // date in milliseconds

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var min = date.getMinutes();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (hour < 10) hour = '0' + hour;
    if (min < 10) min = '0' + min;

    dateStr = day + "." + month + "." + year + " " + hour + ":" + min;

    return dateStr;
}

// find only 24h posts 
function is24(datesArr) {
    var currentTS = Math.floor(Date.now() / 1000); // current time in senconds (timestamp)
    var yesterdayTS = currentTS - (24 * 3600); // yesterday's timestamp

    document.getElementById("plainText").innerHTML = 'Today posts: <br><br>';
    for (var i = 0; i < datesArr.length; i++) {
        // check if the date is in 24h 
        if (datesArr[i] >= yesterdayTS && datesArr[i] <= currentTS) {
            document.getElementById("plainText").innerHTML += JSON.stringify(newJSONobj.posts[i], null, 3) + '<br>';
        }
    }

}

// make arrays from JSON data
function arrays() {
    var upvotesArr = [];
    var comentsArr = [];
    var scoresArr = [];
    var datesArr = datesArrNum;

    for (var i in newJSONobj.posts) {
        upvotesArr.push(newJSONobj.posts[i].upvotes);
        comentsArr.push(newJSONobj.posts[i].num_comments);
        scoresArr.push(newJSONobj.posts[i].score);
    }
    return [upvotesArr, comentsArr, scoresArr, datesArr];
}

// get checked value from the form
function getRadioValue() {
    var sort = document.forms[0];
    var choice = "";
    var i;
    for (i = 0; i < sort.length; i++) {
        if (sort[i].checked) {
            choice = sort[i].value;
        }
    }
    return choice;
}

// make arrays for further computing
function tempArray(val) {
    var arr = [];
    var tempArr = [];
    var arrs = arrays();

    switch (val) {
        case "upvotes":
            arr = arrs[0];
            tempArr = arr.concat().sort(function (a, b) { return b - a });
            break;
        case "score":
            arr = arrs[1];
            tempArr = arr.concat().sort(function (a, b) { return b - a });
            break;
        case "num_comments":
            arr = arrs[2];
            tempArr = arr.concat().sort(function (a, b) { return b - a });
            break;
        case "created":
            arr = arrs[3];
            tempArr = arr.concat().sort(function (a, b) { return b - a });
            break;
    }
    return [arr, tempArr];
}

// get indexes in decending order
function getIndex(arr, arrTemp) {
    var index = [];
    for (var i = 0; i < arrTemp.length; i++) {
        for (var j = 0; j < arr.length; j++) {
            if (arrTemp[i] === arr[j]) {
                index[i] = j;
            }
        }
    }
    return index;
}

//get max value and array of indexes 
function getMax(arr) {
    var max = arr[0];
    var index = [];

    // get max value
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] >= max) {
            max = arr[i];
        }
    }

    // get an array of indexes with max value
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === max) {
            max = arr[i];
            index.push(i);
        }
    }

    return [max, index];
}