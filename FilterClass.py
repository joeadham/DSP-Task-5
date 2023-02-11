from scipy import signal
import numpy as np

class Filter: 
    
    def __init__(self, zerosReal=[],zerosImg=[], polesReal=[],polesImg=[],gain = 1):
        if zerosImg != [] and not isinstance(zerosImg[0],complex):
            for i in range(len(zerosImg)):
                zerosImg[i] *= 1j
        if polesImg != [] and not isinstance(polesImg[0],complex):
            for i in range(len(polesImg)):
                polesImg[i] *= 1j
        
        self.zeros = zerosReal + zerosImg
        self.poles = polesReal + polesImg
        self.gain = gain

    def getZeros(self):
        return self.zeros
    
    def getPoles(self):
        return self.poles
    
    def getGain(self):
        return self.gain
    
    def getFreqAndComplexGain(self):
        freq,complexGain = signal.freqz_zpk(self.getZeros(),self.getPoles(),self.getGain())
        return freq,complexGain
     
    def getMagInLogAndPhase(self):
        _,complexGain = self.getFreqAndComplexGain()
        magInLog = 20*np.log10(abs(complexGain))
        phase = np.unwrap(np.angle(complexGain))
        return magInLog,phase
    
    def getOutput(self,input):
        num, den = signal.zpk2tf(self.getZeros(),self.getPoles(), self.getGain())
        output_signal =  signal.lfilter(num, den, input)
        return output_signal
    def getFilterOrder(self):
        order = max(len(self.getZeros()), len(self.getPoles()))
        return order