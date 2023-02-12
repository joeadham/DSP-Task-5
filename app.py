import logging
from ast import literal_eval
from flask import Flask, jsonify, make_response, render_template, request,session, redirect, url_for
import os
from scipy import signal
import numpy as np
import pandas as pd
import json
import plotly
import plotly.express as px
import time
from FilterClass import Filter
app = Flask(__name__)
app.secret_key = "s3cr3t"
app.debug = False
app._static_folder = os.path.abspath("templates/static/")


angles3 = np.zeros(512)
phases = []
input = []
operatingfilter = Filter([],[],[],[])

combined_poles = []
combined_zeros = []
input_signal = []


def getFirstFiveAndThrNinth(str):
    firstFive = ''
    for i in range(5):
        firstFive += str[i]
    
    return firstFive,str[9]

@app.route("/", methods=["POST", "GET"])
def main():
    global input
    input = []
    global operatingfilter
    operatingfilter = Filter([],[],[],[])
    if 'i' not in session:
        session['i'] = 0
    session['i'] = 0
    if 'fileName' not in session:
        session['fileName'] = ''
    return render_template("/layouts/trial.html")

@app.route("/plotMagAndPhase", methods=["POST", "GET"])
def plotMagAndPhase():
    print(request.values)
    data = {}
    for key, value in request.values.items():
        data[ key ] = value
    zerosReal = []
    zerosImg = []
    polesReal = []
    polesImg = []
    for key,value in data.items():
        firstFive,ninth = getFirstFiveAndThrNinth(key)
        valueF = float(value)
        if firstFive == 'zeros' and ninth == 'r':
            zerosReal.append(valueF)
        elif firstFive == 'zeros' and ninth == 'i':
            zerosImg.append(valueF)
        elif firstFive == 'poles' and ninth == 'r':
            polesReal.append(valueF)
        else:
            polesImg.append(valueF)
            
            
    print(zerosReal,zerosImg,polesReal,polesImg)
    global operatingfilter
    operatingfilter = Filter(zerosReal,zerosImg,polesReal,polesImg)
    freq,_ = operatingfilter.getFreqAndComplexGain()
    magInLog,phase = operatingfilter.getMagInLogAndPhase()
    
    return json.dumps({'freq':freq.tolist(),'mag':magInLog.tolist(),'phase':phase.tolist()})

@app.route('/data', methods=["GET", "POST"])
def data():
    if request.method == 'POST':
        filename = request.values['filename']
        #reads the csv file
        df = pd.read_csv(filename)
        
        if session['i']+1 >= len(df):
            session['i'] = 0
            return json.dumps({'inputX': -1,'inputY':-1,'outputY':-1})

        if session['fileName'] != filename:
            session['fileName'] = filename
            session['i'] = 0
            
        
        #plots the signal
        index = session['i']
        session['i'] += 1
        index %= len(df)
        
        inputPoint = df.iloc[index][1]
        input.append(inputPoint)
        
        order = operatingfilter.getFilterOrder()
        if len(input) > (2*order) and len(input) > 50:
            del input[0:order]

    
        
        
        output = operatingfilter.getOutput(input)
        outputPoint = output[-1]
        
        time.sleep(0.1)
        return json.dumps({'inputX': index,'inputY':inputPoint,'outputY':float(outputPoint)})

def getComplex(complexStr):
    
    complex_number_strings = complexStr
    complex_numbers = [literal_eval(cn) for cn in complex_number_strings]
    # print(complex_numbers)
    return complex_numbers

@app.route("/send_apf_list", methods=["POST"])
def send_apf_list():
    apf_list = request.get_json()
    # print(apf_list)
    coefficients = 0
    for key,value in apf_list.items():
        coefficients = value
    # for coefficient in coefficient:
    coefficients = getComplex(coefficients)
    
    allPassZeros = []
    allPassPoles = []
    updatedPhaseZeros = operatingfilter.getZeros()
    updatedPhasePoles = operatingfilter.getPoles()
    for coefficient in coefficients:
        allPassZeros.append(1/np.conj(coefficient))
        allPassPoles.append(coefficient)
        updatedPhaseZeros.append(1/np.conj(coefficient))
        updatedPhasePoles.append(coefficient)
    print(updatedPhaseZeros)
    
    allPassFilter = Filter([],[],[],[])
    allPassFilter.setZeros(allPassZeros)
    allPassFilter.setPoles(allPassPoles)
    
    operatingfilter.setZeros(updatedPhaseZeros)
    operatingfilter.setPoles(updatedPhasePoles)
    
    apfFreq,_ = allPassFilter.getFreqAndComplexGain()
    _,apfPhase = allPassFilter.getMagInLogAndPhase()
    
    updatedPhaseFreq,_ = operatingfilter.getFreqAndComplexGain()
    _,updatedPhasePhase = operatingfilter.getMagInLogAndPhase()
    print(updatedPhaseFreq)
    print('upp'*20)
    print(updatedPhasePhase)
    print(coefficients)
    
    
    return jsonify({'apfFreq':apfFreq.tolist(),'apfPhase':apfPhase.tolist(),'updatedPhaseFreq':updatedPhaseFreq.tolist(),'updatedPhasePhase':updatedPhasePhase.tolist()})

@app.route("/allpass", methods=["POST", "GET"])
def allpass():
    return render_template("/layouts/allpass.html")

@app.route("/main", methods=["POST", "GET"])
def trial():
    return redirect(url_for('main'))


@app.route("/postmethod", methods=["POST"])
def post_javascript_data():
    global angles3
    jsdata1 = request.form["zeros_data"]
    jsdata2 = request.form["poles_data"]
    jsdata3 = request.form["lambdaP"]
    flag = request.form["flag"]
    k = 1
    z = json.loads(jsdata1)
    p = json.loads(jsdata2)
    lambdaa = json.loads(jsdata3)
    flag = json.loads(flag)

    for i in range(len(z)):
        z[i] = round(z[i][0], 2)+ 1j * round(z[i][1], 2)
    for i in range(len(p)):
        p[i] = round(p[i][0], 2) + 1j * round(p[i][1], 2)

    w, h = signal.freqz_zpk(z, p, k)
    w = np.round(w, 2)
    angles = np.unwrap(np.angle(h))
    angles2 = np.zeros(512)
    h = 20 * np.log10(np.abs(h))
    w = w.tolist()
    h = h.tolist()
    if lambdaa == 5:
        for phase in phases:
            _, h2 = signal.freqz([phase, 1.0], [1.0, np.conj(phase)])
            angles2 += np.unwrap(np.angle(h2))
        if not np.all(angles):
            angles3 = np.zeros(512)
        else:
            angles3 = np.add(angles, angles2)
            # print(type(angles3))
        if len(phases) == 0:
            angles2 = np.zeros(512)
            angles3 = angles
        else:
            _, h2 = signal.freqz([phases[-1], 1.0], [1.0, np.conj(phases[-1])])
            angles2 = np.unwrap(np.angle(h2))
    elif flag:
        lambdaa = complex(lambdaa)
        _, h2 = signal.freqz([lambdaa, 1.0], [1.0, np.conj(lambdaa)])
        angles2 = np.unwrap(np.angle(h2))
        angles3 = np.add(angles3, angles2)
        phases.append(lambdaa)
    else:
        lambdaa = complex(lambdaa)
        _, h2 = signal.freqz([lambdaa, 1.0], [1.0, np.conj(lambdaa)])
        angles2 = np.unwrap(np.angle(h2))
        if np.all(angles3):
            angles3 = np.subtract(angles3, angles2)
        phases.remove(lambdaa)
        if len(phases) == 0:
            angles2 = np.zeros(512)
    angles = angles.tolist()
    angles2 = angles2.tolist()
    angles4 = angles3.tolist()

    params = {
        "magnitudeX": w,
        "magnitudeY": h,
        "angles": angles,
        "angles2": angles2,
        "angles3": angles4,
    }
    return jsonify(params)


@app.route('/generated', methods=['GET', 'POST'])
def generated():
    jsonData = request.get_json()
    input_point = float(jsonData['y_point'])
    input_signal.append(input_point)

    order = operatingfilter.getFilterOrder()
#   To save calculations
    if (order < 1):
        return json.dumps({"y_point": input_point})
#   Cut the signal to save memory
    if len(input_signal) > 2 * order and len(input_signal) > 50:
        del input_signal[0:order]

    output = operatingfilter.getOutput(input_signal)
    outputPoint = output[-1]
    return json.dumps({"y_point": outputPoint})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug = True)
