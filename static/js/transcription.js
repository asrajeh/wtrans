document.addEventListener('DOMContentLoaded', function () {



	//Variables:
	//Variable: sample wave to be loaded when user haven't yet upload one
	var sampleWave = "http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3";

	//Variable: of the directory to upload the audio files on 
	var fileName = "../../static/js/waveFiles/";
	//Variable: Undo array to save steps.
	var undoArray = [];
	//Variable: Wave surfer object.
	var wavesurfer;
	//Variable: Speaker ID - Incremented.
	var sID = 0;
	//Variable: To compare the stored transcription with the newly entered one to detect change.
	var before = "";
	//Variable: JSON array of Speakers objects.
	var speakers = {
		"speakers": [
			{
				"name": "Speaker 0",
				"id": "0",
				"r": Math.floor(Math.random() * 256),
				"g": Math.floor(Math.random() * 256),
				"b": Math.floor(Math.random() * 256)
	}
]
	};
	//Variable: Random color for the unassigned regions.
	var defaultR = Math.floor(Math.random() * 256);
	var defaultG = Math.floor(Math.random() * 256);
	var defaultB = Math.floor(Math.random() * 256);
	
	//Variable: Keep track of the last chosen speaker to set it as the default one.
	var currentSpeaker = -1;
	
	//Variable: Fill the speakers panel with one pre created speaker.
	$('#speakers-panel').append('<div class="speaker-element"><p id = "' +
		speakers.speakers[0].id +
		'">' +
		speakers.speakers[0].name +
		' </p> <a class = "edit-speaker" id ="' +
		speakers.speakers[0].id +
		'_edit"><i id = "edit" class="fas fa-pen"></i>' +
		'<a class = "delete-speaker" id ="' +
		speakers.speakers[0].id +
		'_delete"><i id="delete" class="fas fa-times"></i></a></p></div>');

	//Variable: Initialize waveSurfer
	wavesurfer = WaveSurfer.create({
		container: '#waveform',
		height: 100,
		pixelRatio: 1,
		scrollParent: true,
		normalize: true,
		minimap: true,
		backend: 'MediaElement'
	});

	if (sessionStorage.getItem('waveurl') == null)
		//10) load an Audio to the waveSurfer object
		wavesurfer.load(sampleWave);
	else {
		wavesurfer.load(sessionStorage.getItem('waveurl'));
		console.log(sessionStorage.getItem('waveurl'));
		sessionStorage.setItem("waveurl", sampleWave);
	}

	//Event Listeners:
	// Setting up the wave 
	wavesurfer.on('ready', function () {

		// Timeline - plugin
		var timeline = Object.create(WaveSurfer.Timeline);

		timeline.init({
			wavesurfer: wavesurfer,
			container: '#waveform-timeline'
		});


		// Play button
		document
			.querySelector('[data-action="play"]')
			.addEventListener('click', wavesurfer.playPause.bind(wavesurfer));


		// Backward by 1 sec.
		$("#button-frwrd").click(function () {
			wavesurfer.skipForward(1);
		});


		// Forward by 1 sec.
		$("#button-bkwrd").click(function () {
			wavesurfer.skipBackward(1);
		});


		// Enable region selection
		wavesurfer.enableDragSelection({
			color: 'rgba(' + defaultR + ',' + defaultG + ',' + defaultB + ', 0.15)'
		});


		// Play region 
		wavesurfer.on('region-click', function (region, e) {


			e.stopPropagation();
			// Play on click, loop on shift click
			e.shiftKey ? region.playLoop() : region.play();

			$('#transcript').html(region.data);
			$("#" + region.id + "_row").css("background", "#e6e6e6");

			window.onkeyup = function (event) {
				keyboardShortcuts(event, region);
			};

		});

	});

	// Event Listener: upon clicking on a region, display its info	
	wavesurfer.on('region-click', displayRegionInfo);

	// Event Listener: upon draging a region, create it	
	wavesurfer.on('region-created', function (region, event) {
		// Add a bin icon on the region
		if (!region.hasDeleteButton) {
			var regionEl = region.element;
			var deleteButton = regionEl.appendChild(document.createElement('deleteButton'));
			deleteButton.className = 'fa fa-trash';

			// Event Listener: Upon clicking on the bin icon, remove the region along with its transcription.
			deleteButton.addEventListener('click', function (e) {
				undoArray.push(region);
				region.remove();
				console.log(region.id);
				$("#" + region.id + "_row").remove();
			});

			deleteButton.title = "Delete region";
			region.hasDeleteButton = true;
			region.speaker = currentSpeaker;
			region.color = speakers.speakers[currentSpeaker].color;
		}

		// Event Listener: Keyboard shortcuts.
		window.onkeyup = function (event) {
			keyboardShortcuts(event, region);
		};

	});

	wavesurfer.on('region-update-end', function (region, event) {
		// Append a new transcription row only if the region doesn't have one.
		if (Object.keys(wavesurfer.regions.list).length > $('#fullscript-table tr').length) {
			appendTranscription(region);
		}

	})

	// Event Listener: when the cursor enters the region		
	wavesurfer.on('region-in', function (region, e) {

		// Retrieve and display region's attributes (speaker,color and data)
		displayRegionInfo(region);

		// Display subtitle above the wave
		$('#current-speaker').css("visibility", "visible");

		// Event Listener: keyboard shortcuts
		window.onkeyup = function (event) {
			keyboardShortcuts(event, region);
		};

	});

	// Event Listener: when the cursor leaves the region	
	wavesurfer.on('region-out', function (region) {

		$('#current-speaker').css("visibility", "hidden");
		$("#" + region.id + "_row").css("background", "#f8f8f8");

	});

	// Event Listener: upon changing the speaker of the region
	$('#fullscript-table').on('change', 'select', function () {

		//Change current speaker
		currentSpeaker = $(this).find('option:selected').val();

		// Update region's speaker and color  
		wavesurfer.regions.list[$(this).attr('id').substring(0, $(this).attr('id').lastIndexOf('_'))].speaker = $(this).find('option:selected').val();

		wavesurfer.regions.list[$(this).attr('id').substring(0, $(this).attr('id').lastIndexOf('_'))].update({
			color: $(this).find('option:selected').attr('data-color')
		});
		console.log(Object.values(wavesurfer.regions.list));
	});

	// Event Listener: upon writing in the transcription area 
	$('#fullscript-table').on('focus', '.editable-td', function () {
			$(this).parent().css("background", "#e6e6e6");
			if ($(this).html() == "Type the transcript here")
				$(this).html("");
			else before = $(this).html();
			var playRegion;
			playRegion = $(this).attr('id');
			wavesurfer.play(wavesurfer.regions.list[playRegion].start);
		})
		.on('blur keyup paste', '.editable-td', function () {
			if ($(this).html() == "") {
				$(this).html("Type the transcript here");
				before = "Type the transcript here";
			}
			if (before != $(this).html()) {
				wavesurfer.regions.list[$(this).attr('id')].update({
					data: $(this).html()
				});
			}

		});

	// Event Listener: General keyboard shortcuts
	window.onkeydown = function (e) {


		if (e.which == 90 && e.ctrlKey) { //ctrl+z undo action
			e.preventDefault();
			if (undoArray.length != 0) {

				var deletedRegion = undoArray.pop();
				wavesurfer.addRegion(deletedRegion);
				appendTranscription(deletedRegion);
			}
		}


		if (e.metaKey && e.key === 'z') { //cmd+z undo action
			e.preventDefault();
			if (undoArray.length != 0) {
				var deletedRegion = undoArray.pop();
				wavesurfer.addRegion(deletedRegion);
				appendTranscription(deletedRegion);
			}

		} else if (e.which == 72 && e.shiftKey) { //shift+h for next segment
			var currentPosition = wavesurfer.getCurrentTime();

			for (var key in wavesurfer.regions.list) {
				if (wavesurfer.regions.list[key].start > currentPosition) {
					wavesurfer.play(wavesurfer.regions.list[key].start);
					break;
				}

			}


		} else if (e.which == 66 && e.shiftKey) { // shift+b for previous segment 
			var currentPosition = wavesurfer.getCurrentTime();


			var regionsCopy = [];
			var i = 0;

			for (var key in wavesurfer.regions.list) {

				regionsCopy[i] = wavesurfer.regions.list[key];
				if (wavesurfer.regions.list[key].end >= currentPosition) {
					break;
				}
				i++;
			}
			if (i >= 1)
				wavesurfer.play(regionsCopy[i - 1].start);

		} else if (e.which == 39 && e.shiftKey) { //shift + right arrow for forward skip 1 sec action 
			// Forward by 1 sec.
			wavesurfer.skipForward(1);
		} else if (e.which == 37 && e.shiftKey) { //shift + right arrow for backward skip 1 sec action 
			// Backward by 1 sec.
			wavesurfer.skipBackward(1);
		} else if (e.shiftKey && e.which == 32) { //shift + space for play\pause action 
			wavesurfer.playPause();

		}

	};

	// Event Listener: Alert help message
	$('#help').click(function () {
		swal("Select a range of seconds to segment and transcript.");

	});

	// Event Listener: Export transcription as CSV file
	$('#export').click(function () {
		var html = document.querySelector("table").outerHTML;
		export_table_to_csv(html, "transcription.csv");
	});

	// Event Listener: to edit speaker's name upon clicking on the pen
	$('#speakers-panel').on('click', '.edit-speaker', function () {

		swal("Enter speaker's name:", {
				content: "input",
			})
			.then((value) => {

				var speakerId = $(this).attr('id').substring(0, $(this).attr('id').indexOf('_'));

				var elementId = $(this).attr('id');
				console.log(elementId);

				for (var key in speakers.speakers) {

					if (speakers.speakers[key].id == speakerId) {
						speakers.speakers[key].name = value;
						$('#' + elementId + '').parent().children(':first').html(value);

					}

				}
				$('select option[value="' + speakerId + '"]').html(value);


			});
	});

	// Event Listener: to delete the speaker
	$('#speakers-panel').on('click', '.delete-speaker', function () {
		var elementId = $(this).attr('id');
		var speakerId = $(this).attr('id').substring(0, $(this).attr('id').indexOf('_'));

		$('#' + elementId + '').parent().remove();
		for (var key in speakers.speakers) {

			if (speakers.speakers[key].id == speakerId) {
				speakers.speakers.splice(key, 1);
				break;
			}
			console.log(Object.values(speakers.speakers));
		}
		$('select option[value="' + speakerId + '"]').remove();
		console.log(Object.values(speakers.speakers));
	});

	// Event Listener: to add a new speaker.
	$('#plus').click(function () {
		'use strict';

		var id = generateID();
		speakers.speakers[id] = ({
			"name": "Speaker " + id,
			"id": id,
			"r": Math.floor(Math.random() * 256),
			"g": Math.floor(Math.random() * 256),
			"b": Math.floor(Math.random() * 256)
		});

		var speakerId = speakers.speakers[id].id;
		var speakerName = speakers.speakers[id].name;
		var speakerColor = 'rgba(' +
			speakers.speakers[id].r +
			',' +
			speakers.speakers[id].g +
			',' +
			speakers.speakers[id].b +
			',0.15)';

		$('#speakers-panel').append('<div class="speaker-element"><p id = "' +
			speakerId +
			'">' +
			speakerName +
			' </p> <a class = "edit-speaker" id ="' +
			speakerId +
			'_edit"><i id = "edit"class="fas fa-pen"></i>' +
			'<a class = "delete-speaker" id ="' +
			speakerId +
			'_delete"><i id="delete" class="fas fa-times"></i></a></p></div>');


		$('select').append('<option value="' + speakerId + '" data-color="' +
			speakerColor +
			'">' +
			speakerName +
			'</option>');
	});

	// Event Listener: to upload an existing audio file .
	$("#wavUpload").change(function () {
		readURL(this);
	});


	// Event Listener: Find silence end and start time
	$('#silence').click(function () {
		// Uncomment this to work with the python file script_root.py
		/*
		var silences = [] ; 
			$.getJSON(SCRIPTROOT + '/_find_silences', {
			path: fileName
		
		}, function (data) {
				
		   silences  = data.result;// silences list, silence starts at i and ends at i+1  
			alert(data.result);
				
			console.log(silences);
				
				for (var i = 0 ; i<silences.length;i++){

					break;

				}
		});
		
		return false;*/

	});
	
	// Function: Retrieve and display region's attributes (speaker,color and data)
	function displayRegionInfo(region) {

		var textColor = region.color.substring(0, region.color.length - 4);
		textColor = textColor + "1)";

		$('#transcript-field').val("");
		$('#sub-speaker').html("");
		$('#sub-transcript').html("");
		if (!jQuery.isEmptyObject(region.data)) {
			$('#transcript-field').val(region.data);
			if (region.speaker == -1)
				$('#sub-speaker').html("Unassigned speaker: ");
			else
				$('#sub-speaker').html("" + speakers.speakers[region.speaker].name + ": ");
			$('#sub-speaker').css({
				"padding-left": "15",
				"padding-right": "15",
				"background": region.color,
				"color": textColor,
				"border-radius": "20px",
				"width": "auto",
				"font-weight": "bold",
				"line-height": "35px",
				"height": "35px"
			});
			$('#sub-transcript').html(region.data);
			$('#current-speaker').css("visibility", "visible");
		}
		$('#seg-duration').html("This segment starts at <b>" + region.start.toFixed(2) + " </b> ends at <b>" + region.end.toFixed(2) + "</b>");

	}

	// Function: to increment speakers ID (sID)
	function generateID() {
		sID += 1;
		return sID;
	}

	// Function: Keyboard shortcuts that controls to region
	function keyboardShortcuts(e, region) {


		if (e.shiftKey && e.which == 8) {
			undoArray.push(region);
			region.remove();
			$("#" + region.id + "_row").remove();
		}



	}

	// Function: Append a transcription row 
	function appendTranscription(region) {


		// Retrieve the region's transcription if there's any.
		var editableTranscript = "Type the transcript here";
		if (!jQuery.isEmptyObject(region.data)) {
			editableTranscript = region.data;
		}

		// Add table row to enable transcription
		$('.default-text').css("display", "none");
		var added = false;
		var newRow = '<tr id="' +
			region.id + '_row"> <td class="speakers-dropdown"><select id="' +
			region.id + '_speakers"><option value="reset"  disabled selected>Choose a speaker ↓</option></select> </td>' +
			'<td class="seconds" id="' +
			region.id + '_seconds">' +
			region.start.toFixed(2) + ' - ' + region.end.toFixed(2) + '</td>' +
			'<td class="editable-td" id="' +
			region.id + '" contentEditable="true">' +
			editableTranscript + '</td> </tr>';

		// Append the transcription row in the right place	
		if ($('#fullscript-table tr').length > 0) {
			$('#fullscript-table tr').each(function () {
				if (region.end < $(this).find("td:nth-child(2)").html().substring(0, $(this).find("td:nth-child(2)").html().indexOf(' ')) && !added) {
					$(newRow).insertBefore($(this));
					added = true;
				}

			});

		}

		// if the region has the latest seconds, append at the last position.
		if (!added) {
			$('#fullscript-table').append(newRow);
			added = false;
		}


		// Fill the speakers dropdown list with the speakers.
		for (var key in speakers.speakers) {
			var speakerId = speakers.speakers[key].id;
			var speakerName = speakers.speakers[key].name;
			var speakerColor = 'rgba(' +
				speakers.speakers[key].r +
				',' +
				speakers.speakers[key].g +
				',' +
				speakers.speakers[key].b +
				',0.15)';

			$('#' + region.id + '_speakers').append('<option value="' + speakerId + '" data-color="' +
				speakerColor +
				'">' +
				speakerName +
				'</option>');
		}

		// Set the latest selected speaker as the default one.
		if (currentSpeaker != -1) {
			region.color = 'rgba(' +
				speakers.speakers[currentSpeaker].r +
				',' +
				speakers.speakers[currentSpeaker].g +
				',' +
				speakers.speakers[currentSpeaker].b +
				',0.15)';
			$('#' + region.id + '_speakers option[value="' + currentSpeaker + '"]').attr("selected", "selected");
		}

	}

	// Function: Prepare the CSV file 
	function export_table_to_csv(html, filename) {
		var csv = [];
		$('#fullscript-table tr').each(function () {

			var row = []
			var duration = $(this).find('td:eq(1)').text() + "";
			var start = duration.substring(0, duration.indexOf(' '));
			var end = duration.substring(duration.indexOf('-') + 1);
			row.push($(this).find('td:eq(0)').find('option:selected').text());
			row.push(start);
			row.push(end);
			row.push($(this).find('td:eq(2)').text());
			csv.push(row.join(","));
		});



		download_csv(csv.join("\n"), filename);

	}


	// Function: Download CSV
	function download_csv(csv, filename) {
		var csvFile;
		var downloadLink;

		// CSV FILE
		csvFile = new Blob([csv], {
			type: "text/csv"
		});

		// Download link
		downloadLink = document.createElement("a");

		// File name
		downloadLink.download = filename;

		// We have to create a link to the file
		downloadLink.href = window.URL.createObjectURL(csvFile);

		// Make sure that the link is not displayed
		downloadLink.style.display = "none";

		// Add the link to your DOM
		document.body.appendChild(downloadLink);

		// Lanzamos
		downloadLink.click();
	}



	// Function: upload the audio file to the directory static/js/waveFiles 
	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				sessionStorage.setItem("waveurl", e.target.result);

				var data = new FormData();
				data.append('input_file_name', $("#wavUpload").prop('files')[0]);
				console.log($("#wavUpload").prop("files")[0]);
				fileName += $("#wavUpload").prop("files")[0].name;

				// append other variables to data if you want: data.append('field_name_x', field_value_x);

				$.ajax({
					type: 'POST',
					processData: false, // important
					contentType: false, // important
					data: data,
					url: "../../static/js/uploadWave.php",
					dataType: 'script',
					// in PHP you can call and process file in the same way as if it was submitted from a form:
					// $_FILES['input_file_name']
					success: function (data, status) {
						console.log(status);
					}

				});

			}
			reader.readAsDataURL(input.files[0]);
		}
		location.reload();
	}



});
