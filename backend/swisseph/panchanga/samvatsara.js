/**
 * Samvatsara Calculator
 * Calculates the name of the year in the 60-year cycle
 */

const BaseCalculator = require('../core/baseCalculator');

class SamvatsaraCalculator extends BaseCalculator {
    constructor() {
        super();
        this.SAMVATSARAS = [
            'Prabhava', 'Vibhava', 'Shukla', 'Pramoda', 'Prajāpati', 'Āngirasa', 'Shrīmukha', 'Bhāva',
            'Yuva', 'Dhātri', 'Īshvara', 'Bahudhānya', 'Pramādhi', 'Vikrama', 'Vrisha', 'Chitrabhānu',
            'Subhānu', 'Tārana', 'Pārthiva', 'Vyaya', 'Sarvajit', 'Sarvadhāri', 'Virodhi', 'Vikrita',
            'Khara', 'Nandana', 'Vijaya', 'Jaya', 'Manmatha', 'Durmukha', 'Hevilambi', 'Vilambi',
            'Vikāri', 'Shārvari', 'Plava', 'Shubhakrit', 'Shobhana', 'Krodhi', 'Vishvāvasu', 'Parābhava',
            'Plavanga', 'Kīlaka', 'Saumya', 'Sādhārana', 'Virodhikrit', 'Paridhāvi', 'Pramādi', 'Ānanda',
            'Rākshasa', 'Nala', 'Pingala', 'Kālayukti', 'Siddhārthi', 'Raudra', 'Durmati', 'Dundubhi',
            'Rudhirodgāri', 'Raktākshi', 'Krodhana', 'Akshaya'
        ];
    }

    /**
     * Get Samvatsara and Hindu Years
     */
    getSamvatsara(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Shaka Samvat starts around March/April
        const shakaYear = month >= 3 ? (year - 78) : (year - 79);
        const vikramaYear = month >= 3 ? (year + 57) : (year + 56);

        // Samvatsara index in the 60 year cycle
        const samvatsaraIndex = (shakaYear - 1) % 60;

        return {
            name: this.SAMVATSARAS[samvatsaraIndex],
            shakaYear,
            vikramaYear,
            kaliYear: shakaYear + 3179
        };
    }
}

module.exports = SamvatsaraCalculator;
