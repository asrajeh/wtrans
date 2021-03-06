#!/usr/bin/env python
# Find silences in a wavfile and print start and end of each one in seconds
# Written by Alrajeh based on split_wav.py from https://gist.github.com/rudolfbyker
#
# ./silences.py <file> <duration> <threshold>
# ./silences.py sample.wav .1 .0001

from scipy.io import wavfile
import numpy as np
import sys
from flask import Flask, jsonify, render_template, request
app = Flask(__name__)


silence_list = []

	
	

def windows(signal, window_size, step_size):
    if type(window_size) is not int:
        raise AttributeError("Window size must be an integer.")
    if type(step_size) is not int:
        raise AttributeError("Step size must be an integer.")
    min_w = 0
    max_w = 0
    for i_start in range(0, len(signal), step_size):
        i_end = i_start + window_size
        if i_end >= len(signal):
            break
        yield signal[i_start:i_end]

def energy(samples):
    return np.sum(np.power(samples, 2.)) / float(len(samples))

def edges(binary_signal):
    previous_value = 0
    index = 0
    for x in binary_signal:
        if x and not previous_value:
            yield index
        if previous_value and not x:
            yield index
        previous_value = x
        index += 1
def silences(sample ,duration , threshold):
	silence_list.clear()
	filename = sample
	window_duration = float(duration)
	step_duration = window_duration / 1.
	silence_threshold = float(threshold)

	sample_rate, samples = wavfile.read(filename, mmap=True)
	#max_amplitude = max(samples)
	#max_amplitude = np.iinfo(samples.dtype).max
	#max_energy = energy([max_amplitude])

	window_size = int(window_duration * sample_rate)
	step_size = int(step_duration * sample_rate)

	signal_windows = windows(
		signal=samples,
    	window_size=window_size,
    	step_size=step_size
	)

	#window_energy = [energy(w) / max_energy for w in signal_windows]
	window_energy = [energy(w) for w in signal_windows]
	min_e = min(window_energy)
	max_e = max(window_energy)

	#window_silence = [e < silence_threshold for e in window_energy]
	window_silence = ((e-min_e)/(max_e-min_e) < silence_threshold for e in window_energy)
	times = [r*step_duration for r in edges(window_silence)]
	
	for i in range(0, len(times), 2):
		if i+1<len(times):
			print(times[i], times[i+1])
			silence_list.append(times[i])
			silence_list.append(times[i+1]) 
		else:
			print(times[i], len(samples)/float(sample_rate))
			silence_list.append(times[i])
			silence_list.append(len(samples)/float(sample_rate)) 
			
		


@app.route('/_find_silences')
def add_numbers():
	a = request.args.get('path', None, type=str)
	silences(a,.1,.0001)
	return jsonify(result=silence_list)

@app.route('/')
def index():
    return render_template('layouts/transcription.html')



if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port = 5000)

'''
# plot times for debugging
import matplotlib.pyplot as plt
x = [i/float(sample_rate) for i in range(len(samples))]
plt.plot(x, samples)
plt.plot(times, [0 for i in times], 'ro')
plt.plot([i+window_duration for i in times], [0 for i in times], 'k.')
plt.show()
'''
