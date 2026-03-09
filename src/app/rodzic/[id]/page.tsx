import ParentView from "./ParentView";

type ParentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ParentPage({ params }: ParentPageProps) {
  const { id } = await params;
  return <ParentView parentId={id} />;
}
