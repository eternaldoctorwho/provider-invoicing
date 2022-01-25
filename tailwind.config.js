module.exports = {
  theme: {
    extend: {
        fontFamily: {
            'sans': ['HelveticaNeue', 'sans-serif'],
            
        },
        colors: {
            yellow: '#FFE3A3',
            blue: '#0079AE',
            lightblue: '#D5EAED',
            darkgray: '#757575',
            gray: '#9E9E9E',
            lightgray: '#E0E0E0',
            verylightgray: '#FAFAFA',
            orange: '#CC4400',
            infoBoxOrange: '#FF9D52',
            lightorange: '#FFF3E6',
            ratinglightorange: '#D48806',
            darkgreen: '#237804',
            lightgreen: '#74A803',
            red: '#A8071A',
            lightblack: '#212121',
            whitesmoke: '#F5F5F5',
            progressbargray: '#BDBDBD66',
            footerText: '#707070',
            footerBackground: '#EEEEEE',
            footerLink: '#1E90BA',
            copyrightBackground: '#DEDEDE',
            popupText: '#005A87',
            popupBackground: '#BBDEF0',
            palegreen: '#F6FFED',
            paleyellow: '#FFFBE6',
            paleorange: '#FFF3E6',
            verydarkgray: '#616161',
            formElementBorder: '#D0D0D0',
        },
        inset: {
            '-50percent': '-50%',
            '-100percent': '-100%',
            '-200percent': '-200%',
            '-300percent': '-300%',
            '-400percent': '-400%',
        },
        minHeight: {
            'top-bar': '5.875rem',
        },
        maxHeight: {
            'logo': '5.875rem',
        },
        height: {
            '35': '8.75rem',
        },
        width: {
            '1/8': '12.5%',
            'menu-icon': '1.75rem',
            '60': '15.25rem',
        },
        minWidth: {
            '1/8': '12.5%',
        },
        margin: {
            '-1/3': '-33.333333%',
            '-1/8': '-12.5%',
        },
        transitionProperty: {
            'margin': 'margin',
            'width': 'width',
            'height': 'height',
            'width-opacity': 'width, opacity',
        },
        boxShadow: {
            default: '0 3pt 6pt rgba(0, 0, 0, 0.16)',
            top: '0 -4pt 6pt rgba(0, 0, 0, 0.16)',
            br: '3pt 3pt 3pt rgba(0, 0, 0, 0.16)',
            ratingcategories: '0px 3px 6px #00000029',
            ratingcategory: '0px 2px 3px #0000003C',
            ratingdetails: '0px -3px 6px #00000033',
        },
        fontSize: {
            providerRatingHeader: '1.375rem',
            providerCategoryPercentileValue: '2.75rem',
            providerCategoryPercentageValue: '3.25rem',
            '7xl': '5rem',
            '8xl': '6rem',
        },
        lineHeight: {
            providerCategoryPercentileValue: '2.75rem',
            providerCategoryPercentageValue: '3.25rem',
            '8xl': '6rem',
        },
        fill: {
            none: "none",
        },
        stroke: {
            yellow: '#FFE3A3',
            orange: '#CC4400',
        }
    },
  },
  variants: {
    padding: ['responsive', 'hover', 'focus'],
    margin: ['responsive', 'hover', 'focus'],
  },
  plugins: [
  ]
}
