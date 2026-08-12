import { Link } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { SoliSolaWordmark } from 'app/branding'

export const AudiusHomeLink = () => {
  return (
    <TouchableOpacity>
      <Link screen='music' params={{}}>
        <SoliSolaWordmark height={24} />
      </Link>
    </TouchableOpacity>
  )
}
