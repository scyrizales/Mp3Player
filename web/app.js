/**
 * Created by scastillo on 12/10/14.
 */
angular.module("mp3Player", ["ngRoute"]);

angular.module("mp3Player").factory("SongDataSvc", ["$http", function ($http) {
    return {
        getStreams: function() {
            return $http.get("streams.json")
        }
    };
}]);

angular.module("mp3Player").factory("SongSocketSvc", ["$http", function ($http) {
    var socket = io.connect('http://localhost');
    var obj = {
        sendUpdate: function(uid, value, property) {
            var data = {
                uid: uid,
                value: value,
                property: property
            };
            socket.emit('updateData', data);
        },
        updateData: function () {}
    };

    socket.on('updateStream', function (data) {
        obj.updateData(data);
    });

    return obj;
}]);

angular.module("mp3Player").controller("StreamController", ["$scope", "SongDataSvc", "SongSocketSvc", function ($scope, SongDataSvc, SongSocketSvc) {
    var audio = $scope.audio = new Audio(),
        song = $scope.song = {
            volume: 1,
            progress: 0,
            paused: false
        };

    $scope.playpause = function(){
        song.paused = !song.paused;
        SongSocketSvc.sendUpdate(song.uid, song.paused, "paused");
    };

    $scope.updateVolume = function () {
        SongSocketSvc.sendUpdate(song.uid, song.volume, "volume");
    };

    $scope.updateProgress = function () {
        SongSocketSvc.sendUpdate(song.uid, song.progress, "progress");
    };

    SongDataSvc.getStreams().success(function(response) {
        var stream = $scope.stream = response.streams[0];

        audio.src = stream.stream_url;
        song.uid = stream.uid;
        audio.play();
    });

    SongSocketSvc.updateData = function (data) {
        if (data.uid == $scope.stream.uid) {
            if (data.property == "volume") {
                audio.volume = song.volume = data.value;
            }

            if (data.property == "paused") {
                song.paused = data.value;
                if (song.paused) {
                    audio.pause();
                } else {
                    audio.play();
                }
            }

            if (data.property == "progress") {
                audio.currentTime = data.value;
            }
        }
    };

    setInterval(function () {
        $scope.$apply(function () {
            song.progress = audio.currentTime;
        });
    }, 1000);
}]);