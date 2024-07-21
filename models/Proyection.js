const { v4: uuidv4 } = require('uuid');
console.log( uuidv4());

class Proyection {
    id = '';
    teamName = '';
    goalsFprediction = 0;
    drawsProbability = 0;
    winProbability = 0;
    winTakenMatchsHistory = 0;
    HasPonderationsProbabiltytoWin = 0


    constructor(teamName='',goalsFprediction =0,drawsProbability=0,winProbability=0,winTakenMatchsHistory=0,HasPonderationsProbabiltytoWin=0){
        this.id = uuidv4();
        this.teamName = teamName;
        this.goalsFprediction = goalsFprediction;
        this.drawsProbability = drawsProbability;
        this.winProbability = winProbability;
        this.winTakenMatchsHistory = winTakenMatchsHistory;
        this.HasPonderationsProbabiltytoWin = HasPonderationsProbabiltytoWin
    }
}
module.exports = Proyection;