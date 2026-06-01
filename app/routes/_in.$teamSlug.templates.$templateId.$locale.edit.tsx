import { type MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Edit - Video Localization',
    },
  ];
};

export default function EditPage() {
  return null;

  // return (
  //   <div className="border-b border-border bg-card">
  //     <div className="container mx-auto px-6 py-4">
  //       <div className="flex items-center justify-between">
  //         <div>
  //           <h1 className="text-2xl font-bold text-foreground">Edit Mode</h1>
  //           <p className="text-muted-foreground">
  //             Make changes to your video template
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
