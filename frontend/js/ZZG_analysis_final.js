//Function for transposing 2D arrays.
function transpose(array) {
    return array.reduce((prev, next) => next.map((item, i) =>
        (prev[i] || []).concat(next[i])
    ), []);
}

// Format EEG Data to be analyzed. Return an array of arrays (signal values for channel x time).
function format_eegdata(eeg_data){
  var eeg_data_formatted = [];
  for (i=0;i<eeg_data.length;i++){
    eeg_dic = eeg_data[i];
    eeg_channels = eeg_dic["eeg"]
    eeg_channels = eeg_channels.slice(3,eeg_channels.length-2);
    eeg_data_formatted[i] = eeg_channels;
  }
  eeg_data_formatted = transpose(eeg_data_formatted);
  return eeg_data_formatted
}

// Format Power Data to be analyzed. Return an array of arrays (band power values for each channel x time).
function format_powerdata(power_data){
  var power_data_formatted = [];
  for (i=0;i<power_data.length;i++){
    power_dic = power_data[i];
    power_channels = power_dic["pow"]
    power_data_formatted[i] = power_channels;
  }
  power_data_formatted = transpose(power_data_formatted);
  return power_data_formatted
}

// Load Formatted Data
var eeg_data_formatted = format_eegdata(eeg_data);
var power_data_formatted = format_powerdata(power_data);

//console.log(format_eegdata(eeg_data));
//console.log(format_powerdata(power_data));

//Sums arrays
function sumArray(a, b) {
  var c = [];
  for (var i = 0; i < Math.max(a.length, b.length); i++) {
    c.push((a[i] || 0) + (b[i] || 0));
  }
  return c;
}

//Divide arrays
function divideArray(array, divisor) {
  var i = array.length, a, k;
  while (i) { // loop over each item in array
      a = array[--i];
      for (k in a) { // loop over each key in object
          if (a.hasOwnProperty(k)) { // ignore inherited keys
              a[k] = a[k] / divisor; // calculate
          }
      }
  }
  return array;
}

// WAVES DATA

// average theta_waves data usnig the sumArray of every fifth
// power_data_formatted element, starting at 0 and ending at 65
var theta_waves = []
for (var i = 0; i <= 65; i += 5) {
  theta_waves = sumArray(theta_waves,power_data_formatted[i]);
}
theta_waves = divideArray(theta_waves,14)


// average alpha_waves data usnig the sumArray of every fifth
// power_data_formatted element, starting at 1 and ending at 66
var alpha_waves = []
for (var i = 1; i <= 66; i += 5) {
  alpha_waves = sumArray(alpha_waves,power_data_formatted[i]);
}
alpha_waves = divideArray(alpha_waves,14)

// average alpha_waves data usnig the sumArray of every fifth
// power_data_formatted element, starting at 1 and ending at 66
var beta_waves = []
for (var i = 1; i <= 67; i += 5) {
  beta_waves = sumArray(beta_waves,power_data_formatted[i]);
}
beta_waves = divideArray(beta_waves,14)

// average gamma_waves data usnig the sumArray of every fifth
// power_data_formatted element, starting at 4 and ending at 69
var gamma_waves = []
for (var i = 4; i <= 69; i += 5) {
  gamma_waves = sumArray(gamma_waves,power_data_formatted[i]);
}
gamma_waves = divideArray(gamma_waves,14)


//Get time interval windows for a signal channel
function get_time_intervals(data_row,window_size){
  var intervals = [];
  var interval = [];
  for (i=0; i<data_row.length;i++){
    //if ((i+1)<window_size){
      //for (j=0;j<(window_size-i);j++){
        //interval.push(data_row[0]);
        //interval.concat(data_row.slice(0,i));
      //}
    //} else {
    if ((i+1)>window_size){
      interval = data_row.slice(i-window_size,i);
      intervals.push(interval);
    }
  }
  return intervals
}

//SLEEP QUALITY
// x is the time window of 350 datapoints(IED channels from EEG data).
// Returns one datapoint representing entropy.

function entropy(x){
  var tot = 0.0;
  var ent = 0.0;
  for (i=0;i < x.length; i++){
    tot = tot + Math.pow(x[i], 2);
  }
  for (i=0;i < x.length; i++){
    var quo = Math.pow(x[i], 2) / tot;
    ent = ent + (quo * Math.log10(quo));
  }
  var y = -ent;
  return y
}

//console.log(eeg_data_formatted);
//console.log(eeg_data_formatted[1]);
//console.log(get_time_intervals(eeg_data_formatted[1],2));
//console.log(eeg_data_formatted[1]);
//console.log(get_time_intervals(eeg_data_formatted[1],4));

//eeg_rows = eeg_data_formatted.length;
//eeg_column = eeg_data_formatted.length[1].length

function zeros(dimensions) {
    var array = [];
    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }
    return array;
}

rows = eeg_data_formatted.length
columns = eeg_data_formatted[1].length

var entropy_matrix = zeros([rows,columns]);
//Calculate entropy for each data point. i for each row of channel.
for (i=0;i < eeg_data_formatted.length; i++){
  windows_values = get_time_intervals(eeg_data_formatted[i],2);
  for (w=0;w<windows_values.length;w++){
		console.log(windows_values[w]);
    entropy_matrix[i][w] = entropy(windows_values[w])
  }
}

var column_avg = col => {
	var sum = 0.0
	col.map(e => sum += e)
	return sum / col.length
}

//Use this to create chart
entropy_data = entropy_matrix.map(e => column_avg(e));

console.log(entropy_data);

//When displaying the graph, multiply entropy by -1 and adjust the scale appropriately for better visuals.

//SLEEP STAGES
//Start session with Stage 1. End Stage 1 with start of Stage 2.
// Stage 1 has mixed-frequency EEG tracing with a considerable representation of theta-wave activity (4–7 Hz) and some alpha-activity.
//Stage 2 start with K-complexes and sleep spindles less than 3 minutes apart.
//Stage 2 is characterized by typical intermittent short sequences of waves of 11–15 Hz (“sleep spindles”) and decreased alpha-activity.
//Stage 3 is when slow waves occupy more than 20 percent of the 30-second window of an EEG tracing.
//Stage 3 has high delta
//Stage 4 has higher delta
//Stage 5 has dramatic decrease in delta power
//Stage 5 ends with increase in theta
//Max delta power during stage 4 normalized as 100

//initializations
var stage = 1;
//time intervals for different stages of sleep
stage_1_duration = [0]
stage_2_duration = []
stage_3_duration = []
stage_4_duration = []
stage_4_duration = []

delta_power = theta_waves //temporary setup due to delta waves being unavailable

//Loop for Session
for (time = 0; time<length(thelta_waves.length); time++){
  if (stage == 1){
		if (delta_power[time]>30){
			stage = 2;
	    stage_1_duration.push(time);
	    stage_2_duration.push(time+1);
		}
	} else if (stage == 2){
		if(delta_power[time]>40){
			stage = 3;
			stage_2_duration.push(time);
			stage_3_duration.push(time+1);
		}
	} else if(stage == 3){
  	if (delta_power[time] > 80){
	    stage = 4;
	    stage_3_duration.push(time);
	    stage_4_duration.push(time+1);
		}
  } else if (stage == 4){
		 if (delta_power[time] < 50){
			 stage = 5;
	     stage_4_duration.push(time);
	     stage_5_duration.push(time+1);
		 }
	} else if (stage[time] == 5){
		if (delta_power > 30){
			stage_5_duration.push(time);
			break;
		}
	}
}
