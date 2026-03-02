import { Button } from 'react-native-paper';
import { styles } from '../../styles/Styles.js';

export const AppButton = ({ children, style, labelStyle, ... props}) => (
    <Button
        {...props}
        style={[styles.button, style]}
        labelStyle={[{ fontFamily: 'SpaceGrotesk'}, labelStyle]}
    >
        {children}
    </Button>
);