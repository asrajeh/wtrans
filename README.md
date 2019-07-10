# wTrans

## 1. Introduction
To support efficient, careful and consistent transcription, we developed a web based application to provide a portable version of the famous transcription tools that are used now, We developed a speech annotation toolkit wTrans, to support a full range of speech annotation tasks including quick and careful transcription. All the components are written javascript.

## 2. Tool Overview
This section gives a very brief introduction to the tool design and layout.
![Page layout](../master/images/wTrans-screenshot.png)

**(1) The Audio Panel**
This region includes the waveform display and audio control buttons (left to right) forward skip (1 sec ), play/ pause and backward skip (1 sec), on the upper right corner there is a help button to inform the user how to select a segment and starts transcription [figure 2].

When you put your mouse on the region there is tooltip indicates the start and end time by seconds.
You can adjust the size by moving the start or end edges of the segment and also you can change the position of the segment by dragging it.
<img src="../master/images/help-alert.png" width="1200px">


**(2) The Transcript Panel**  
This region shows two columns. The first one is the transcribed text, the second one shows the corresponding speaker if you’ve selected it from the speaker’s drop down list, if you didn’t select any speaker yet the segment will be assigned to the last speaker you added. If you select a region (by clicking your mouse somewhere within that segment), the transcription will be highlighted in gray and the corresponding speaker and transcription will appear on top of the sound wave. 


**(3) The Speakers Panel**
This region displays the speakers list and a plus button to add more speakers and pen icon to change the speaker’s name.

## 3. Getting Started
**3.1** Audio File is already uploaded in the code (for future work it’s better if we can upload it while using the app).

**3.2** Open Transcript File (Future work).

## 4. Audio Segmentation
 The first stage of transcription is segmentation, which refers to the process of virtually chopping a long audio file into smaller meaningful units. Segmentation can be done with the mouse only (future work is adding shortcut for it). 
 
 ## 5. Assign Speaker Information
 From the speakers panel you can add a speaker by clicking the plus button. Changing the speaker’s name is done by clicking on the pen icon next to the speaker’s name.  Deleting the speaker is done by clicking the X button. The speaker’s assignment to the segment is done from the drop down list in transcription panel that is linked to the segment. 
 
 <img src="../master/images/edit-speaker's-name.png" width="1200px">
 [Figure 3]. Edit speaker’s name

 ## 6. Transcription
The basic transcription process involves typing the words that correspond to an existing segment. Recall that the transcript and waveform display are linked in that you can click on a segment in the waveform and wTrans will find that segment in the transcript.
 
 **6.1** Language Input Functions By design, wTrans supports only English.
 
 ## 7. Shortcuts
- Ctrl+z  for undo deletion.
- Backspace delete segment
- Space play/pause.
- Right arrow forward skip (1 sec).
- Left arrow backward skip (1 sec).
- Ctrl+h move to next segment.
- Ctrl+b move to previous segment. 


## HTML
**Library used** 
**jQuery** 
JavaScript library designed to simplify HTML DOM tree traversal and manipulation.

**Font Awesome** 
Font and icon toolkit based on css and less.

**Wavesurfer** 
Customizable audio waveform visualization, built on top of web audio API and HTML5 
Canvas.

**Sweetalert** 
JavaScript library that provides a replacement for standard alert() dialogue.


## JavaScript
## Global variables 
undoArray: Stores the deleted segments.
wavesurfer: wavesurfer object.
sID: speakers id, increases by one.
speakers: "speakers": JSON array of Speakers objects.
currentSpeaker: Keep track of the last chosen speaker to set it as the default one.
defaultR: Random color for the unassigned regions.
defaultG: Random color for the unassigned regions.
defaultB: Random color for the unassigned regions.
before: To compare the stored transcription with the newly entered one to detect change.

## Event Listeners 
```wavesurfer.on('ready', function ())``` 
Fires when wavesurfer.js load the file and display the waveform image.
 

```wavesurfer.on('region-created', function (region, event))```
Fires when the user starts dragging the segment and when the user undo deleting the segment.

```wavesurfer.on('region-click', displayRegionInfo)```
Fires when the mouse click on the region, the information of the segment are retrieved and displayed such as, the subtitle above the waveform and highlight its transcription.

```wavesurfer.on('region-in', function (region, e))```
Fires when playback enters the region, the information of the segment are retrieved and displayed such as, the subtitle above the waveform and highlight its transcription.
It also calls the keyboardShortcuts(event, region) function in case the user use and keyboard shortcut.


```wavesurfer.on('region-out', function (region)```
Fires when playback leaves the region.
Removes visibility of speaker’s transcription that appears on top of the wave.
Removes highlight from segment’s transcription.

```$('#fullscript-table').on('change', 'select', function ())```
Fires when the user change the speaker of the selected segment.

```$('#fullscript-table').on('focus', '.editable-td', function ())```
Fires when the user select/click on some transcription field to edit or write a transcript.

```window.onkeydown = function (e)```
Fired when the user uses one of the general keyboard shortcuts, such as play/pause, undo, jump to the next/previous segment, forward or backward by 1 second.

```$('#help').click(function (){})```
Fired when the user clicks on the button, an informing alert appears.

```$('#plus').click(function (){})```
Fires when the user clicks on the plus button in the speakers panel to add a new speaker.

```$('#speakers_panel').on('click', '.edit-speaker', function ())```
Fires when the user clicks on the pen icon to edit speaker's name.

```$('#speakers-panel').on('click', '.delete-speaker', function () {})```
Fires when the user clicks on the bin icon to delete the speaker.



## Functions

```displayRegionInfo(region)```
Retrieves region's attributes (speaker,color and data) then displays them in their places.

```generateID()``` 
Increments the ID counter 

```keyboardShortcuts(e, region)```
This function is called in these events: region-in, region-click and region-created. They send the current region along with the keyboard event.

```appendTranscription(region)```
This function is called upon creating or recreating (when user undo deletion) to append the transcription row of the region.

## Useful tools

**WaveSurfer library**
https://wavesurfer-js.org/

**Sweetalert library**
https://sweetalert.js.org/

**Fontawesome library**
https://fontawesome.com/

**xTrans Transcription tool user manual**
https://www.ldc.upenn.edu/sites/www.ldc.upenn.edu/files/xtrans-manual-v3.0.pdf
