import { Popover } from 'bootstrap'
export const popover = {
  mounted(el) {
    new Popover(el, { trigger: 'hover' })    
  },
  updated(el) {    
    try {
      const t = Popover.getInstance(el)      
      if (t) {
        if (el.attributes?.enabled?.value === 'false') {
          t.disable()
        } else {
          t.enable()
        }
        if (el.attributes?.title?.value) {
          t.setContent({ '.popover-header': el.attributes.title.value })
        }   
        if (el.attributes?.dataBsContent?.value) {
            t.setContent({ '.popover-body': el.attributes.title.value })
          }     
      }         
    } catch (error) {
      console.log(error)
    }   
  },
}