function fixTurkishCharacters(text) {
            if (!text) return text;
            const replacements = {
                'İ': 'İ',
                'ı': 'ı',
                'i': 'i',
                'ğ': 'ğ',
                'Ğ': 'Ğ',
                'ş': 'ş',
                'Ş': 'Ş',
                'ü': 'ü',
                'Ü': 'Ü',
                'ö': 'ö',
                'Ö': 'Ö',
                'ç': 'ç',
                'Ç': 'Ç'
            };

            return text.replace(/[İıiğĞşŞüÜöÖçÇ]/g, char => replacements[char] || char);
        }
