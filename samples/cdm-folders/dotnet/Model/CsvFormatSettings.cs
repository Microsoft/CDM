﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

namespace Microsoft.CdmFolders.SampleLibraries
{
    using Newtonsoft.Json;

    /// <summary>
    /// CSV file format settings
    /// </summary>
    [JsonObject(MemberSerialization.OptIn)]
    public class CsvFormatSettings : FileFormatSettings
    {
        /// <summary>
        /// Gets or sets a value indicating whether the csv contains headers
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
        public bool ColumnHeaders { get; set; } = false;

        /// <summary>
        /// Gets or sets the csv delimiter
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Delimiter { get; set; } = ",";

        /// <summary>
        /// Gets or sets the quote style
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
        public CsvQuoteStyle QuoteStyle { get; set; } = CsvQuoteStyle.Csv;

        /// <summary>
        /// Gets or sets the csv style
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
        public CsvStyle CsvStyle { get; set; } = CsvStyle.QuoteAlways;

        /// <inheritdoc/>
        public override FileFormatSettings Clone()
        {
            return new CsvFormatSettings
            {
                ColumnHeaders = this.ColumnHeaders,
                QuoteStyle = this.QuoteStyle,
                CsvStyle = this.CsvStyle,
                Delimiter = this.Delimiter
            };
        }
    }
}
