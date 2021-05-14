// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

/// <summary>
/// EventList is a supporting class for the logging system and allows subset of messages
/// emitted by the SDK to be collected and inspected by the SDK users. The events are stored
/// in an ordered list, each element being a dictionary of string keys and string values.
/// 
/// Upon completion of the API call, the recorded events can be inspected by the host application
/// to determine what step to take to address the issue. To simply list all events and their elements,
/// a simple for-each like this will work:
/// 
/// corpus.Ctx.Events.ForEach(
///     logEntry => logEntry.ToList().ForEach(
///         logEntryPair => Console.WriteLine($"{logEntryPair.Key}={logEntryPair.Value}")
///     )
/// );
/// 
/// Note: this class is NOT a replacement for standard logging mechanism employed by the SDK. It serves
/// specifically to offer immediate post-call context specific diagnostic information for the application
/// to automate handling of certain common problems, such as invalid file name being supplied, file already
/// being present on the file-system, etc.
/// </summary>
export class EventList {
    get length(): number {
        return this.allItems.length;
    }
    
    /// <summary>
    /// Specifies whether event recording is enabled or not.
    /// </summary>
    isRecording: boolean;
    /// <summary>
    /// Counts how many times we entered into nested functions that each enable recording.
    /// We only clear the previously recorded events if the nesting level is at 0.
    /// </summary>
    private nestingLevel: number;

    allItems: Map<string, string>[];

    constructor() {
        this.isRecording = false;
        this.nestingLevel = 0;
        this.allItems = [];
    }

    /// <summary>
    /// Clears the log recorder and enables recoding of log messages.
    /// </summary>
    enable(): void {
        // If we are going into nested recorded functions, we should not clear previously recorded events
        if (this.nestingLevel == 0) {
            this.allItems = [];
            this.isRecording = true;
        }

        this.nestingLevel++;
    }

    /// <summary>
    /// Disables recording of log messages.
    /// </summary>
    disable(): void {
        this.nestingLevel--;

        if (this.nestingLevel == 0) {
            this.isRecording = false;
        }
    }

    /// <summary>
    /// Shortcut method to add a new entry to the events. The entry will be added
    /// only if the recording is enabled.
    /// </summary>
    /// <param name="theEvent"></param>
    push(theEvent: Map<string, string>): void {
        if (this.isRecording) {
            this.allItems.push(theEvent);
        }
    }
}
