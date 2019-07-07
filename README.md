#wTrans

##1. Introduction
To support efficient, careful and consistent transcription, we developed a web based application to provide a portable version of the famous transcription tools that are used now, We developed a speech annotation toolkit wTrans, to support a full range of speech annotation tasks including quick and careful transcription. All the components are written javascript.

##2. Tool Overview
This section gives a very brief introduction to the tool design and layout.
![alt text](wTrans-Screenshot.png)

**(1) The Audio Panel**
This region includes the waveform display and audio control buttons (left to right) forward skip (1 sec ), play/ pause and backward skip (1 sec), on the upper right corner there is a help button to inform the user how to select a segment and starts transcription [figure 2].

When you put your mouse on the region there is tooltip indicates the start and end time by seconds.
You can adjust the size by moving the start or end edges of the segment and also you can change the position of the segment by dragging it.

**(2) The Transcript Panel**  
This region shows two columns. The first one is the transcribed text, the second one shows the corresponding speaker if you’ve selected it from the speaker’s drop down list, if you didn’t select any speaker yet the segment will be assigned to the last speaker you added. If you select a region (by clicking your mouse somewhere within that segment), the transcription will be highlighted in gray and the corresponding speaker and transcription will appear on top of the sound wave. 
