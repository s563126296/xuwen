export default function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      borderLeft: '3px solid #00D0E9',
      paddingLeft: 8,
      borderBottom: '1px solid rgba(0,208,233,0.1)',
      paddingBottom: 6,
      marginBottom: 10,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#E0E8FF' }}>{title}</span>
    </div>
  );
}
